document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('policyForm');
    const previewContainer = document.getElementById('previewContainer');
    const startOverBtn = document.getElementById('startOverBtn');
    const copyBtn = document.getElementById('copyBtn');
    const citationFormatContainer = document.getElementById('citationFormatContainer');
    const citationFormat = document.getElementById('citationFormat');
    const otherCitationFormat = document.getElementById('otherCitationFormat');
    const customCitationFormat = document.getElementById('customCitationFormat');
    const otherDocumentationContainer = document.getElementById('otherDocumentationContainer');
    const citationStyleContainer = document.getElementById('citationStyleContainer');
    const citationStyle = document.getElementById('citationStyle');
    const otherCitationStyleContainer = document.getElementById('otherCitationStyleContainer');
    const reflectionDirectionsContainer = document.getElementById('reflectionDirectionsContainer');

    // Show/hide citation format selector based on citation selection
    function toggleCitationFormat() {
        const selectedOption = document.querySelector('input[name="citation"]:checked');
        if (selectedOption && selectedOption.value === 'formal') {
            citationFormatContainer.classList.remove('hidden');
        } else {
            citationFormatContainer.classList.add('hidden');
        }
    }

    // Show/hide other citation format input
    function toggleOtherCitationFormat() {
        if (citationFormat.value === 'other') {
            otherCitationFormat.classList.remove('hidden');
        } else {
            otherCitationFormat.classList.add('hidden');
        }
    }

    // Show/hide citation style dropdown based on formal citation selection
    function toggleCitationStyle() {
        const formalCitationCheckbox = document.querySelector('input[name="documentation"][value="citation"]');
        if (formalCitationCheckbox && formalCitationCheckbox.checked) {
            citationStyleContainer.classList.remove('hidden');
        } else {
            citationStyleContainer.classList.add('hidden');
            citationStyle.value = '';
            otherCitationStyleContainer.classList.add('hidden');
        }
    }

    // Show/hide other citation style input
    function toggleOtherCitationStyle() {
        if (citationStyle.value === 'other') {
            otherCitationStyleContainer.classList.remove('hidden');
        } else {
            otherCitationStyleContainer.classList.add('hidden');
        }
    }

    // Show/hide other documentation input
    function toggleOtherDocumentation() {
        const otherCheckbox = document.querySelector('input[name="documentation"][value="other"]');
        if (otherCheckbox && otherCheckbox.checked) {
            otherDocumentationContainer.classList.remove('hidden');
        } else {
            otherDocumentationContainer.classList.add('hidden');
        }
    }

    // Show/hide reflection directions input
    function toggleReflectionDirections() {
        const reflectionCheckbox = document.querySelector('input[name="documentation"][value="reflection"]');
        if (reflectionCheckbox && reflectionCheckbox.checked) {
            reflectionDirectionsContainer.classList.remove('hidden');
        } else {
            reflectionDirectionsContainer.classList.add('hidden');
        }
    }

    // Handle conditional questions based on AI usage
    function handleConditionalQuestions() {
        const aiUsage = document.querySelector('input[name="aiUsage"]:checked');
        const citationQuestion = document.getElementById('question3');
        const documentationQuestion = document.getElementById('question4');
        const allowedUsesQuestion = document.getElementById('question2_5');

        if (aiUsage) {
            if (aiUsage.value === 'prohibited') {
                citationQuestion.classList.add('hidden');
                documentationQuestion.classList.add('hidden');
                allowedUsesQuestion.classList.add('hidden');
            } else if (aiUsage.value === 'limited') {
                citationQuestion.classList.remove('hidden');
                documentationQuestion.classList.remove('hidden');
                allowedUsesQuestion.classList.remove('hidden');
            } else {
                citationQuestion.classList.remove('hidden');
                documentationQuestion.classList.remove('hidden');
                allowedUsesQuestion.classList.add('hidden');
            }
        }
    }

    // Update text based on policy scope
    function updatePolicyScope() {
        const policyScope = document.querySelector('input[name="policyScope"]:checked');
        if (policyScope) {
            const isCourse = policyScope.value === 'course';
            document.querySelectorAll('.course-text').forEach(el => {
                el.classList.toggle('hidden', !isCourse);
            });
            document.querySelectorAll('.assignment-text').forEach(el => {
                el.classList.toggle('hidden', isCourse);
            });
        }
    }

    // Get documentation text
    function getDocumentationText() {
        const selectedOptions = Array.from(document.querySelectorAll('input[name="documentation"]:checked'))
            .map(checkbox => {
                if (checkbox.value === 'other') {
                    const customText = document.getElementById('customDocumentation').value.trim();
                    return {
                        text: customText,
                        icon: 'fas fa-plus-circle'
                    };
                }
                if (checkbox.value === 'citation') {
                    const citationStyleSelect = document.getElementById('citationStyle');
                    let citationText = 'You must provide formal citations for AI-generated content';
                    if (citationStyleSelect && citationStyleSelect.value) {
                        if (citationStyleSelect.value === 'other') {
                            const customStyle = document.getElementById('customCitationStyle').value.trim();
                            if (customStyle) {
                                citationText += ` using ${customStyle} style`;
                            }
                        } else {
                            citationText += ` using ${citationStyleSelect.value} style`;
                        }
                    }
                    return {
                        text: citationText,
                        icon: 'fas fa-file-signature'
                    };
                }
                if (checkbox.value === 'reflection') {
                    const customDirections = document.getElementById('customReflectionDirections').value.trim();
                    let reflectionText = 'You must include a reflection on your AI usage and learning process';
                    if (customDirections) {
                        reflectionText += `: ${customDirections}`;
                    }
                    return {
                        text: reflectionText,
                        icon: 'fas fa-brain'
                    };
                }
                const cardContent = checkbox.closest('.option-card').querySelector('.card-content');
                const policyScope = document.querySelector('input[name="policyScope"]:checked');
                const isCourse = policyScope ? policyScope.value === 'course' : true;
                const text = cardContent.querySelector(isCourse ? 'p:not(.hidden)' : 'p.assignment-text').textContent;
                return {
                    text: text,
                    icon: cardContent.querySelector('i').className
                };
            })
            .filter(item => item.text);

        if (selectedOptions.length === 0) return '';
        
        const policyScope = document.querySelector('input[name="policyScope"]:checked');
        const isCourse = policyScope ? policyScope.value === 'course' : true;
        const context = isCourse ? 'in this course' : 'for this assignment';
        
        const header = `If you use AI ${context}, you must also:`;
        const requirements = selectedOptions.map(item => 
            `<div class="requirement-item">
                <i class="${item.icon}"></i>
                <span>${item.text}</span>
            </div>`
        ).join('');

        return `${header}\n${requirements}`;
    }

    // Get allowed uses text
    function getAllowedUsesText() {
        const selectedOptions = Array.from(document.querySelectorAll('input[name="allowedUses"]:checked'))
            .map(checkbox => {
                if (checkbox.value === 'other') {
                    const customText = document.getElementById('customAllowedUses').value.trim();
                    return {
                        text: customText,
                        icon: 'fas fa-plus-circle'
                    };
                }
                const cardContent = checkbox.closest('.option-card').querySelector('.card-content');
                return {
                    text: cardContent.querySelector('p').textContent,
                    icon: cardContent.querySelector('i').className
                };
            })
            .filter(item => item.text);

        if (selectedOptions.length === 0) return '';
        
        const header = 'You may use AI tools for the following uses only:';
        const uses = selectedOptions.map(item => 
            `<div class="requirement-item">
                <i class="${item.icon}"></i>
                <span>${item.text}</span>
            </div>`
        ).join('');

        return `${header}\n${uses}`;
    }

    // Update policy preview
    function updatePolicyPreview() {
        const formData = new FormData(form);
        const policySections = [];
        let documentationAdded = false;
        let allowedUsesAdded = false;

        // Process each question and its answer
        for (let [name, value] of formData.entries()) {
            if (name === 'citation_format' && value === 'other') {
                value = formData.get('customCitationFormat');
            }
            
            const questionContainer = document.querySelector(`[data-question="${name}"]`);
            if (questionContainer && !questionContainer.classList.contains('hidden')) {
                if (name === 'documentation' && !documentationAdded) {
                    const selectedOptions = Array.from(document.querySelectorAll('input[name="documentation"]:checked'));
                    if (selectedOptions.length > 0) {
                        const text = getDocumentationText();
                        if (text) {
                            policySections.push({
                                text: text,
                                icon: 'fas fa-tasks',
                                isDocumentation: true
                            });
                            documentationAdded = true;
                        }
                    }
                } else if (name === 'allowedUses' && !allowedUsesAdded) {
                    const selectedOptions = Array.from(document.querySelectorAll('input[name="allowedUses"]:checked'));
                    if (selectedOptions.length > 0) {
                        const text = getAllowedUsesText();
                        if (text) {
                            policySections.push({
                                text: text,
                                icon: 'fas fa-check-circle',
                                isDocumentation: true
                            });
                            allowedUsesAdded = true;
                        }
                    }
                } else if (name !== 'documentation' && name !== 'allowedUses') {
                    const selectedOption = questionContainer.querySelector(`input[name="${name}"]:checked`);
                    if (selectedOption) {
                        const cardContent = selectedOption.closest('.option-card').querySelector('.card-content');
                        const icon = cardContent.querySelector('i').className;
                        const answer = cardContent.querySelector('p:not(.hidden)').textContent;
                        
                        // Convert teacher-focused language to student-focused language
                        let studentText = answer;
                        if (name === 'policyScope') {
                            studentText = answer.replace('This policy will apply', 'This policy applies');
                        } else if (name === 'aiUsage') {
                            studentText = answer.replace('AI tools are', 'You may');
                        }
                        
                        policySections.push({
                            text: studentText,
                            icon
                        });
                    }
                }
            }
        }

        // Generate policy statement
        let policyHTML = '';
        policySections.forEach(section => {
            if (section.isDocumentation) {
                const [header, ...requirements] = section.text.split('\n');
                policyHTML += `
                    <div class="policy-section">
                        <i class="${section.icon}"></i>
                        <div class="documentation-section">
                            <p class="documentation-header">${header}</p>
                            <div class="documentation-requirements">
                                ${requirements.join('')}
                            </div>
                        </div>
                    </div>
                `;
            } else {
                policyHTML += `
                    <div class="policy-section">
                        <i class="${section.icon}"></i>
                        <p>${section.text}</p>
                    </div>
                `;
            }
        });

        previewContainer.innerHTML = policyHTML || '<p>Select options to generate your policy statement.</p>';
    }

    // Event Listeners
    form.addEventListener('change', function(e) {
        if (e.target.name === 'policyScope') {
            updatePolicyScope();
        } else if (e.target.name === 'aiUsage') {
            handleConditionalQuestions();
        } else if (e.target.name === 'citation') {
            toggleCitationFormat();
        } else if (e.target.id === 'citationFormat') {
            toggleOtherCitationFormat();
        } else if (e.target.name === 'documentation') {
            toggleOtherDocumentation();
            if (e.target.value === 'citation') {
                toggleCitationStyle();
            } else if (e.target.value === 'reflection') {
                toggleReflectionDirections();
            }
        } else if (e.target.id === 'citationStyle') {
            toggleOtherCitationStyle();
        } else if (e.target.name === 'allowedUses') {
            if (e.target.value === 'other') {
                const container = document.getElementById('otherAllowedUsesContainer');
                container.classList.toggle('hidden', !e.target.checked);
            }
        }
        updatePolicyPreview();
    });

    // Start Over button
    startOverBtn.addEventListener('click', function() {
        form.reset();
        citationFormatContainer.classList.add('hidden');
        otherCitationFormat.classList.add('hidden');
        otherDocumentationContainer.classList.add('hidden');
        citationStyleContainer.classList.add('hidden');
        otherCitationStyleContainer.classList.add('hidden');
        reflectionDirectionsContainer.classList.add('hidden');
        document.getElementById('question3').classList.remove('hidden');
        document.getElementById('question4').classList.remove('hidden');
        updatePolicyScope();
        toggleCitationFormat();
        handleConditionalQuestions();
        updatePolicyPreview();
    });

    // Copy button
    copyBtn.addEventListener('click', function() {
        const policyText = Array.from(previewContainer.querySelectorAll('.policy-section'))
            .map(section => {
                const answer = section.querySelector('p').textContent.trim();
                return answer;
            })
            .join('\n\n');

        navigator.clipboard.writeText(policyText).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        });
    });

    // Handle citation requirements
    const citationInputs = document.querySelectorAll('input[name="citation"]');
    citationInputs.forEach(input => {
        input.addEventListener('change', () => {
            const selectedValue = input.value;
            const documentationSection = document.getElementById('question4');
            
            // Show/hide documentation section based on disclosure requirement
            if (selectedValue === 'none') {
                documentationSection.classList.add('hidden');
                // Uncheck all documentation checkboxes
                document.querySelectorAll('input[name="documentation"]').forEach(checkbox => {
                    checkbox.checked = false;
                });
            } else {
                documentationSection.classList.remove('hidden');
            }
            
            updatePolicyPreview();
        });
    });

    // Handle documentation requirements
    const documentationInputs = document.querySelectorAll('input[name="documentation"]');
    documentationInputs.forEach(input => {
        input.addEventListener('change', () => {
            if (input.value === 'other') {
                const container = document.getElementById('otherDocumentationContainer');
                container.classList.toggle('hidden', !input.checked);
            }
            updatePolicyPreview();
        });
    });

    // Initialize
    updatePolicyScope();
    toggleCitationFormat();
    handleConditionalQuestions();
    updatePolicyPreview();
}); 