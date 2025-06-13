document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('policyForm');
    const previewContainer = document.getElementById('previewContainer');
    const startOverBtn = document.getElementById('startOverBtn');
    const copyBtn = document.getElementById('copyBtn');
    const citationFormatContainer = document.getElementById('citationFormatContainer');
    const citationFormat = document.getElementById('citationFormat');
    const otherCitationFormat = document.getElementById('otherCitationFormat');
    const customCitationFormat = document.getElementById('customCitationFormat');

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

    // Handle conditional questions based on AI usage
    function handleConditionalQuestions() {
        const aiUsage = document.querySelector('input[name="aiUsage"]:checked');
        const citationQuestion = document.getElementById('question3');
        const documentationQuestion = document.getElementById('question4');

        if (aiUsage && aiUsage.value === 'prohibited') {
            citationQuestion.classList.add('hidden');
            documentationQuestion.classList.add('hidden');
        } else {
            citationQuestion.classList.remove('hidden');
            documentationQuestion.classList.remove('hidden');
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

    // Update policy preview
    function updatePolicyPreview() {
        const formData = new FormData(form);
        const policySections = [];

        // Process each question and its answer
        for (let [name, value] of formData.entries()) {
            if (name === 'citation_format' && value === 'other') {
                value = formData.get('customCitationFormat');
            }
            
            const questionContainer = document.querySelector(`[data-question="${name}"]`);
            if (questionContainer && !questionContainer.classList.contains('hidden')) {
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
                    } else if (name === 'citation') {
                        studentText = answer.replace('Students must', 'You must').replace('Students are not required', 'You are not required');
                        
                        // Add citation format if formal citation is required
                        if (selectedOption.value === 'formal') {
                            const citationFormat = document.getElementById('citationFormat');
                            if (citationFormat.value) {
                                let formatText = '';
                                if (citationFormat.value === 'other') {
                                    formatText = formData.get('customCitationFormat');
                                } else {
                                    formatText = citationFormat.options[citationFormat.selectedIndex].text;
                                }
                                if (formatText) {
                                    studentText += ` Please use the ${formatText} format for your citations.`;
                                }
                            }
                        }
                    } else if (name === 'documentation') {
                        studentText = answer.replace('Students must', 'You must').replace('Simple acknowledgment', 'A simple acknowledgment');
                    }
                    
                    policySections.push({
                        text: studentText,
                        icon
                    });
                }
            }
        }

        // Generate policy statement
        let policyHTML = '';
        policySections.forEach(section => {
            policyHTML += `
                <div class="policy-section">
                    <i class="${section.icon}"></i>
                    <p>${section.text}</p>
                </div>
            `;
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
        }
        updatePolicyPreview();
    });

    // Start Over button
    startOverBtn.addEventListener('click', function() {
        form.reset();
        citationFormatContainer.classList.add('hidden');
        otherCitationFormat.classList.add('hidden');
        document.getElementById('question3').classList.remove('hidden');
        document.getElementById('question4').classList.remove('hidden');
        updatePolicyScope();
        updatePolicyPreview();
    });

    // Copy button
    copyBtn.addEventListener('click', function() {
        const policyText = Array.from(previewContainer.querySelectorAll('.policy-section'))
            .map(section => {
                const question = section.querySelector('strong').textContent;
                const answer = section.querySelector('p').textContent.replace(question, '').trim();
                return `${question}\n${answer}`;
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

    // Initialize
    updatePolicyScope();
    toggleCitationFormat();
    handleConditionalQuestions();
    updatePolicyPreview();
}); 