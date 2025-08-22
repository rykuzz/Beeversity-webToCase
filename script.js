/**
 * Multi-Step Salesforce Web-to-Case Form
 * Handles navigation between steps, validation, and user interactions
 */

class MultiStepForm {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formDataBackup = null;
        this.init();
    }

    /**
     * Initialize the form functionality
     */
    init() {
        this.bindEvents();
        this.updateProgress();
        this.showWelcomeMessage();
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Next button events
        document.getElementById('nextStep1').addEventListener('click', () => {
            if (this.validateStep1()) {
                this.nextStep();
            }
        });

        document.getElementById('nextStep2').addEventListener('click', () => {
            if (this.validateStep2()) {
                this.updateReview();
                this.nextStep();
            }
        });

        // Back button events
        document.getElementById('backStep2').addEventListener('click', () => {
            this.prevStep();
        });

        document.getElementById('backStep3').addEventListener('click', () => {
            this.prevStep();
        });

        // Priority badge selection
        document.querySelectorAll('.priority-badge').forEach(badge => {
            badge.addEventListener('click', () => {
                this.selectPriority(badge);
            });
        });

        // Form submission
        document.getElementById('caseForm').addEventListener('submit', (e) => {
            this.handleFormSubmission(e);
        });

        // Real-time validation and progress tracking
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.handleInputChange());
            input.addEventListener('change', () => this.handleInputChange());
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.handleKeyboardNavigation();
            }
        });
    }

    /**
     * Validate Step 1: Contact Information
     * @returns {boolean} - Whether the step is valid
     */
    validateStep1() {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        
        if (!name) {
            this.showError('Please enter your full name');
            document.getElementById('name').focus();
            return false;
        }
        
        if (!email || !this.isValidEmail(email)) {
            this.showError('Please enter a valid email address');
            document.getElementById('email').focus();
            return false;
        }
        
        this.clearErrors();
        return true;
    }

    /**
     * Validate Step 2: Case Details
     * @returns {boolean} - Whether the step is valid
     */
    validateStep2() {
        const recordType = document.getElementById('recordType').value;
        const type = document.getElementById('type').value;
        const reason = document.getElementById('reason').value;
        const priority = document.getElementById('priority').value;
        const subject = document.getElementById('subject').value.trim();
        const description = document.getElementById('description').value.trim();
        
        if (!recordType) {
            this.showError('Please select a department category');
            document.getElementById('recordType').focus();
            return false;
        }
        
        if (!type) {
            this.showError('Please select a request type');
            document.getElementById('type').focus();
            return false;
        }
        
        if (!reason) {
            this.showError('Please select a specific issue');
            document.getElementById('reason').focus();
            return false;
        }
        
        if (!priority) {
            this.showError('Please select a priority level');
            return false;
        }
        
        if (!subject) {
            this.showError('Please enter a subject for your request');
            document.getElementById('subject').focus();
            return false;
        }
        
        if (!description || description.length < 10) {
            this.showError('Please provide a detailed description (at least 10 characters)');
            document.getElementById('description').focus();
            return false;
        }
        
        this.clearErrors();
        return true;
    }

    /**
     * Move to the next step
     */
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.hideCurrentStep();
            this.currentStep++;
            this.showCurrentStep();
            this.updateStepIndicator();
            this.updateProgress();
            this.scrollToTop();
        }
    }

    /**
     * Move to the previous step
     */
    prevStep() {
        if (this.currentStep > 1) {
            this.hideCurrentStep();
            this.currentStep--;
            this.showCurrentStep();
            this.updateStepIndicator();
            this.updateProgress();
            this.scrollToTop();
        }
    }

    /**
     * Hide the current step with animation
     */
    hideCurrentStep() {
        const currentStepElement = document.getElementById(`step${this.currentStep}`);
        currentStepElement.style.animation = 'slideOutLeft 0.3s ease-out';
        setTimeout(() => {
            currentStepElement.classList.remove('active');
            currentStepElement.style.animation = '';
        }, 300);
    }

    /**
     * Show the current step with animation
     */
    showCurrentStep() {
        setTimeout(() => {
            const currentStepElement = document.getElementById(`step${this.currentStep}`);
            currentStepElement.classList.add('active');
            currentStepElement.style.animation = 'slideInRight 0.3s ease-out';
        }, 300);
    }

    /**
     * Update the step indicator
     */
    updateStepIndicator() {
        // Reset all steps
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active', 'completed');
        });

        // Mark completed steps
        for (let i = 1; i < this.currentStep; i++) {
            document.querySelector(`[data-step="${i}"]`).classList.add('completed');
        }

        // Mark current step as active
        document.querySelector(`[data-step="${this.currentStep}"]`).classList.add('active');
    }

    /**
     * Update the progress bar
     */
    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const progress = (this.currentStep / this.totalSteps) * 100;
        progressFill.style.width = progress + '%';
    }

    /**
     * Handle priority badge selection
     * @param {HTMLElement} badge - The selected priority badge
     */
    selectPriority(badge) {
        // Remove active class from all badges
        document.querySelectorAll('.priority-badge').forEach(b => b.classList.remove('active'));
        
        // Add active class to selected badge
        badge.classList.add('active');
        
        // Update hidden select value
        document.getElementById('priority').value = badge.dataset.value;
        
        // Add visual feedback
        this.addSelectionFeedback(badge);
    }

    /**
     * Update the review section with form data
     */
    updateReview() {
        // Contact Information
        document.getElementById('review-name').textContent = 
            document.getElementById('name').value || 'Not provided';
        document.getElementById('review-email').textContent = 
            document.getElementById('email').value || 'Not provided';
        document.getElementById('review-phone').textContent = 
            document.getElementById('phone').value || 'Not provided';
        document.getElementById('review-company').textContent = 
            document.getElementById('company').value || 'Not provided';

        // Case Details
        document.getElementById('review-recordType').textContent = 
            this.getSelectText('recordType') || 'Not selected';
        document.getElementById('review-type').textContent = 
            this.getSelectText('type') || 'Not selected';
        document.getElementById('review-reason').textContent = 
            this.getSelectText('reason') || 'Not selected';
        document.getElementById('review-priority').textContent = 
            document.getElementById('priority').value || 'Not selected';
        document.getElementById('review-subject').textContent = 
            document.getElementById('subject').value || 'Not provided';
        document.getElementById('review-description').textContent = 
            this.truncateText(document.getElementById('description').value, 150) || 'Not provided';
    }

    /**
     * Get the text content of a selected option
     * @param {string} elementId - The ID of the select element
     * @returns {string} - The text content of the selected option
     */
    getSelectText(elementId) {
        const select = document.getElementById(elementId);
        const selectedOption = select.options[select.selectedIndex];
        return selectedOption ? selectedOption.text : '';
    }

    /**
     * Truncate text to a specified length
     * @param {string} text - The text to truncate
     * @param {number} length - The maximum length
     * @returns {string} - The truncated text
     */
    truncateText(text, length) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }

    /**
     * Validate email format
     * @param {string} email - The email to validate
     * @returns {boolean} - Whether the email is valid
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Show error message
     * @param {string} message - The error message to display
     */
    showError(message) {
        this.clearErrors();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const currentStep = document.querySelector('.form-step.active .form-section');
        currentStep.insertBefore(errorDiv, currentStep.firstChild);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.clearErrors();
        }, 5000);
    }

    /**
     * Clear all error messages
     */
    clearErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(error => error.remove());
    }

    /**
     * Handle form submission
     * @param {Event} e - The form submission event
     */
    handleFormSubmission(e) {
        const submitBtn = document.getElementById('submitBtn');
        
        // Validate priority selection
        if (!document.getElementById('priority').value) {
            e.preventDefault();
            this.showError('Please select a priority level');
            return;
        }
        
        // Update button state
        submitBtn.innerHTML = '⏳ Submitting...';
        submitBtn.disabled = true;
        
        // Add loading animation
        submitBtn.style.animation = 'pulse 1s infinite';
        
        // Show success message (for demonstration)
        setTimeout(() => {
            this.showSuccessMessage();
        }, 1000);
    }

    /**
     * Handle input changes for real-time feedback
     */
    handleInputChange() {
        this.clearErrors();
        this.updateFieldValidation();
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyboardNavigation() {
        const activeElement = document.activeElement;
        
        if (this.currentStep < this.totalSteps && activeElement.tagName !== 'TEXTAREA') {
            if (this.currentStep === 1 && this.validateStep1()) {
                this.nextStep();
            } else if (this.currentStep === 2 && this.validateStep2()) {
                this.updateReview();
                this.nextStep();
            }
        }
    }

    /**
     * Add visual feedback for selections
     * @param {HTMLElement} element - The element that was selected
     */
    addSelectionFeedback(element) {
        element.style.transform = 'scale(1.05)';
        setTimeout(() => {
            element.style.transform = '';
        }, 200);
    }

    /**
     * Update field validation styling in real-time
     */
    updateFieldValidation() {
        const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
        
        requiredFields.forEach(field => {
            if (field.value.trim()) {
                field.style.borderColor = '#28a745';
                field.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
            } else {
                field.style.borderColor = '';
                field.style.boxShadow = '';
            }
        });
    }

    /**
     * Scroll to top of form
     */
    scrollToTop() {
        document.querySelector('.container').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        console.log('Multi-Step Salesforce Form initialized successfully!');
    }

    /**
     * Show success message
     */
    showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <div style="
                background: rgba(40, 167, 69, 0.1);
                color: #155724;
                padding: 16px 20px;
                border-radius: 12px;
                margin: 20px 0;
                border: 1px solid rgba(40, 167, 69, 0.3);
                text-align: center;
                animation: fadeInUp 0.5s ease-out;
            ">
                <strong>✅ Form Submitted Successfully!</strong><br>
                <small>Your case has been created and you will receive a confirmation email shortly.</small>
            </div>
        `;
        
        const currentStep = document.querySelector('.form-step.active');
        currentStep.insertBefore(successDiv, currentStep.firstChild);
    }

    /**
     * Save form data to session storage (for form recovery)
     */
    saveFormData() {
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            company: document.getElementById('company').value,
            recordType: document.getElementById('recordType').value,
            type: document.getElementById('type').value,
            reason: document.getElementById('reason').value,
            priority: document.getElementById('priority').value,
            subject: document.getElementById('subject').value,
            description: document.getElementById('description').value,
            currentStep: this.currentStep
        };
        
        try {
            this.formDataBackup = formData;
        } catch (error) {
            console.warn('Could not save form data:', error);
        }
    }

    /**
     * Load form data from session storage
     */
    loadFormData() {
        try {
            if (this.formDataBackup) {
                const formData = this.formDataBackup;
                
                Object.keys(formData).forEach(key => {
                    if (key !== 'currentStep') {
                        const element = document.getElementById(key);
                        if (element && formData[key]) {
                            element.value = formData[key];
                        }
                    }
                });
                
                // Restore priority selection
                if (formData.priority) {
                    const priorityBadge = document.querySelector(`[data-value="${formData.priority}"]`);
                    if (priorityBadge) {
                        this.selectPriority(priorityBadge);
                    }
                }
                
                this.updateProgress();
            }
        } catch (error) {
            console.warn('Could not load form data:', error);
        }
    }

    /**
     * Add smooth transitions for form elements
     */
    addFormAnimations() {
        const formElements = document.querySelectorAll('input, select, textarea, button');
        
        formElements.forEach(element => {
            element.addEventListener('focus', (e) => {
                e.target.style.transform = 'scale(1.02)';
            });
            
            element.addEventListener('blur', (e) => {
                e.target.style.transform = 'scale(1)';
            });
        });
    }

    /**
     * Initialize tooltips for form fields
     */
    initializeTooltips() {
        const fieldsWithTooltips = [
            {
                id: 'description',
                tooltip: 'Provide as much detail as possible to help us resolve your issue quickly'
            },
            {
                id: 'priority',
                tooltip: 'Select the urgency level of your request'
            },
            {
                id: 'recordType',
                tooltip: 'Choose the department that best handles your type of request'
            }
        ];

        fieldsWithTooltips.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
                element.title = field.tooltip;
            }
        });
    }

    /**
     * Add dynamic help text based on selected department
     */
    addDynamicHelp() {
        const recordTypeSelect = document.getElementById('recordType');
        
        recordTypeSelect.addEventListener('change', (e) => {
            const helpTexts = {
                '012NS0000086hDl': 'Academic & Student Affairs handles course registration, grades, transcripts, and academic advising.',
                '012NS0000086hC9': 'Finance & Administration handles tuition fees, scholarships, payments, and financial aid.',
                '012NS0000086ez3': 'IT Support handles technical issues with systems, passwords, software, and network connectivity.',
                '012NS000006eYp7': 'General inquiries and other requests that don\'t fit into specific categories.'
            };
            
            let helpDiv = document.querySelector('.department-help');
            if (!helpDiv) {
                helpDiv = document.createElement('div');
                helpDiv.className = 'department-help';
                helpDiv.style.cssText = `
                    background: rgba(109, 70, 107, 0.1);
                    color: var(--medium-purple);
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-top: 8px;
                    font-size: 0.85rem;
                    border-left: 4px solid var(--medium-purple);
                    animation: fadeInUp 0.3s ease-out;
                `;
                recordTypeSelect.parentElement.appendChild(helpDiv);
            }
            
            const selectedValue = e.target.value;
            if (selectedValue && helpTexts[selectedValue]) {
                helpDiv.textContent = helpTexts[selectedValue];
                helpDiv.style.display = 'block';
            } else {
                helpDiv.style.display = 'none';
            }
        });
    }
}

/**
 * Additional utility functions
 */

/**
 * Add slide out animation
 */
function addSlideOutAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideOutLeft {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(-30px);
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
        }

        .success-message {
            animation: fadeInUp 0.5s ease-out;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialize the form when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Add additional animations
    addSlideOutAnimation();
    
    // Initialize the multi-step form
    const form = new MultiStepForm();
    
    // Add form animations
    form.addFormAnimations();
    
    // Initialize tooltips
    form.initializeTooltips();
    
    // Add dynamic help for departments
    form.addDynamicHelp();
    
    // Load any saved form data
    form.loadFormData();
    
    // Save form data periodically
    setInterval(() => {
        form.saveFormData();
    }, 30000); // Save every 30 seconds
    
    // Add visibility change handler to save data when user leaves
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            form.saveFormData();
        }
    });
    
    console.log('🎓 Student Support Case Form ready!');
});
