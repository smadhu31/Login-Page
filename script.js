document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const tabLogin = document.getElementById('tabLogin');
  const tabSignUp = document.getElementById('tabSignUp');
  const loginFormContainer = document.getElementById('loginFormContainer');
  const signupFormContainer = document.getElementById('signupFormContainer');
  
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  
  const successOverlay = document.getElementById('successOverlay');
  const successTitle = document.getElementById('successTitle');
  const successMessage = document.getElementById('successMessage');
  const successCloseBtn = document.getElementById('successCloseBtn');
  // Input Fields
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  
  const signupName = document.getElementById('signupName');
  const signupEmail = document.getElementById('signupEmail');
  const signupPhone = document.getElementById('signupPhone');
  const signupPassword = document.getElementById('signupPassword');
  const signupConfirmPassword = document.getElementById('signupConfirmPassword');
  const termsCheck = document.getElementById('termsCheck');
  // SVGs for dynamic status icons
  const checkSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  const crossSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>`;
  // RegEx patterns
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^\+?[0-9\s\-()]{10,18}$/; // General phone pattern
  // Track if fields have been touched/edited
  const touchedFields = new Set();
  /* ==========================================================================
     Tab Switcher & Layout Interactions
     ========================================================================== */
  function switchTab(target) {
    if (target === 'login') {
      tabLogin.classList.add('active');
      tabSignUp.classList.remove('active');
      loginFormContainer.classList.add('active');
      signupFormContainer.classList.remove('active');
      resetFormErrors(signupForm);
      setTimeout(() => loginEmail.focus(), 150);
    } else {
      tabSignUp.classList.add('active');
      tabLogin.classList.remove('active');
      signupFormContainer.classList.add('active');
      loginFormContainer.classList.remove('active');
      resetFormErrors(loginForm);
      setTimeout(() => signupName.focus(), 150);
    }
    touchedFields.clear();
  }
  // Bind tab button events
  [tabLogin, tabSignUp].forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target.getAttribute('data-target');
      switchTab(target);
    });
  });
  // Bind footer toggle links
  document.querySelectorAll('.toggle-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = e.target.getAttribute('data-target');
      switchTab(target);
    });
  });
  /* ==========================================================================
     Password Visibility Toggle
     ========================================================================== */
  document.querySelectorAll('.password-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const wrapper = button.closest('.input-wrapper');
      const input = wrapper.querySelector('input');
      const eyeIcon = button.querySelector('.eye-icon');
      const eyeOffIcon = button.querySelector('.eye-off-icon');
      if (input.type === 'password') {
        input.type = 'text';
        eyeIcon.classList.add('hidden');
        eyeOffIcon.classList.remove('hidden');
      } else {
        input.type = 'password';
        eyeIcon.classList.remove('hidden');
        eyeOffIcon.classList.add('hidden');
      }
    });
  });
  /* ==========================================================================
     Form Validation Logic
     ========================================================================== */
  
  // Set validation status styling and icons
  function setFieldStatus(groupElement, isValid, errorMsgId = null, errorMsgText = null) {
    const statusIcon = groupElement.querySelector('.status-icon');
    const errorTextElement = errorMsgId ? document.getElementById(errorMsgId) : null;
    if (isValid) {
      groupElement.classList.add('valid');
      groupElement.classList.remove('invalid');
      if (statusIcon) {
        statusIcon.innerHTML = checkSVG;
      }
    } else {
      groupElement.classList.add('invalid');
      groupElement.classList.remove('valid');
      if (statusIcon) {
        statusIcon.innerHTML = crossSVG;
      }
      if (errorTextElement && errorMsgText) {
        errorTextElement.textContent = errorMsgText;
      }
    }
  }
  function clearFieldStatus(groupElement) {
    groupElement.classList.remove('valid', 'invalid');
    const statusIcon = groupElement.querySelector('.status-icon');
    if (statusIcon) {
      statusIcon.innerHTML = '';
    }
  }
  function resetFormErrors(formElement) {
    formElement.reset();
    formElement.querySelectorAll('.input-group').forEach(group => {
      clearFieldStatus(group);
    });
    // For signup, reset strength meter too
    if (formElement.id === 'signupForm') {
      updatePasswordStrength('');
    }
  }
  // Helper to get digit count from string
  function countDigits(str) {
    const matched = str.match(/\d/g);
    return matched ? matched.length : 0;
  }
  /* --- Field Validators --- */
  function validateLoginEmail(showError = true) {
    const group = document.getElementById('loginEmailGroup');
    const val = loginEmail.value.trim();
    
    if (val === '') {
      if (showError) setFieldStatus(group, false, 'loginEmailError', 'Email address is required.');
      return false;
    }
    
    const isValid = emailRegex.test(val);
    if (showError) {
      setFieldStatus(group, isValid, 'loginEmailError', 'Please enter a valid email address.');
    }
    return isValid;
  }
  function validateLoginPassword(showError = true) {
    const group = document.getElementById('loginPasswordGroup');
    const val = loginPassword.value;
    
    const isValid = val.length > 0;
    if (showError) {
      setFieldStatus(group, isValid, 'loginPasswordError', 'Password is required.');
    }
    return isValid;
  }
  function validateSignupName(showError = true) {
    const group = document.getElementById('signupNameGroup');
    const val = signupName.value.trim();
    
    if (val === '') {
      if (showError) setFieldStatus(group, false, 'signupNameError', 'Full name is required.');
      return false;
    }
    
    // Checks for letters and spaces, and ensures at least 2 words
    const words = val.split(/\s+/).filter(w => w.length > 0);
    const alphabetRegex = /^[a-zA-Z\s]+$/;
    const isValid = words.length >= 2 && alphabetRegex.test(val);
    
    if (showError) {
      let msg = 'Please enter your full name (minimum 2 words).';
      if (!alphabetRegex.test(val)) {
        msg = 'Name can only contain alphabetic letters.';
      } else if (words.length < 2) {
        msg = 'Please enter both your first and last name.';
      }
      setFieldStatus(group, isValid, 'signupNameError', msg);
    }
    return isValid;
  }
  function validateSignupEmail(showError = true) {
    const group = document.getElementById('signupEmailGroup');
    const val = signupEmail.value.trim();
    
    if (val === '') {
      if (showError) setFieldStatus(group, false, 'signupEmailError', 'Email address is required.');
      return false;
    }
    
    const isValid = emailRegex.test(val);
    if (showError) {
      setFieldStatus(group, isValid, 'signupEmailError', 'Please enter a valid email address.');
    }
    return isValid;
  }
  function validateSignupPhone(showError = true) {
    const group = document.getElementById('signupPhoneGroup');
    const val = signupPhone.value.trim();
    
    if (val === '') {
      if (showError) setFieldStatus(group, false, 'signupPhoneError', 'Phone number is required.');
      return false;
    }
    
    // Check if basic format matches and digit count is correct
    // (typically standard international/local phone should contain 10 digits of numbers)
    const digits = countDigits(val);
    const isFormatOk = phoneRegex.test(val);
    const isValid = isFormatOk && digits >= 10;
    
    if (showError) {
      let msg = 'Please enter a valid phone number (minimum 10 digits).';
      if (!isFormatOk) {
        msg = 'Phone contains invalid characters. Use digits, spaces, hyphens, or brackets.';
      } else if (digits < 10) {
        msg = `Phone must contain at least 10 numbers (currently has ${digits}).`;
      }
      setFieldStatus(group, isValid, 'signupPhoneError', msg);
    }
    return isValid;
  }
  // Password Requirements Checker
  function checkPasswordRequirements(val) {
    const reqs = {
      length: val.length >= 8,
      upper: /[A-Z]/.test(val),
      lower: /[a-z]/.test(val),
      number: /[\d\W]/.test(val) // number or special symbol
    };
    // Update requirements visual checklist
    document.getElementById('reqLength').className = reqs.length ? 'valid' : 'invalid';
    document.getElementById('reqUpper').className = reqs.upper ? 'valid' : 'invalid';
    document.getElementById('reqLower').className = reqs.lower ? 'valid' : 'invalid';
    document.getElementById('reqNumber').className = reqs.number ? 'valid' : 'invalid';
    return reqs;
  }
  // Calculate password strength rating (0 - 4 score)
  function updatePasswordStrength(val) {
    const bars = document.querySelectorAll('.strength-bars .bar');
    const textEl = document.querySelector('.strength-text');
    
    if (!val) {
      bars.forEach(bar => bar.style.backgroundColor = 'rgba(255, 255, 255, 0.1)');
      textEl.textContent = '';
      return 0;
    }
    const reqs = checkPasswordRequirements(val);
    let score = 0;
    if (reqs.length) score++;
    if (reqs.upper) score++;
    if (reqs.lower) score++;
    if (reqs.number) score++;
    
    // Special bonus for extra length + complexity
    if (val.length >= 12 && score === 4 && /[\W]/.test(val)) {
      score = 5; // Elite / extra strong
    }
    // Reset bars color
    bars.forEach((bar, idx) => {
      if (idx < score) {
        if (score <= 1) {
          bar.style.backgroundColor = 'var(--error)';
        } else if (score === 2) {
          bar.style.backgroundColor = '#fb923c'; // Orange
        } else if (score === 3) {
          bar.style.backgroundColor = '#facc15'; // Yellow
        } else {
          bar.style.backgroundColor = 'var(--success)'; // Green
        }
      } else {
        bar.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      }
    });
    // Strength text output
    if (score <= 1) {
      textEl.textContent = 'Weak Password';
      textEl.style.color = 'var(--error)';
    } else if (score === 2) {
      textEl.textContent = 'Fair Password';
      textEl.style.color = '#fb923c';
    } else if (score === 3) {
      textEl.textContent = 'Good Password';
      textEl.style.color = '#facc15';
    } else {
      textEl.textContent = 'Strong Password';
      textEl.style.color = 'var(--success)';
    }
    return score;
  }
  function validateSignupPassword(showError = true) {
    const group = document.getElementById('signupPasswordGroup');
    const val = signupPassword.value;
    
    if (val === '') {
      if (showError) setFieldStatus(group, false, null); // requirements explain errors
      return false;
    }
    const reqs = checkPasswordRequirements(val);
    const isValid = reqs.length && reqs.upper && reqs.lower && reqs.number;
    
    if (showError) {
      setFieldStatus(group, isValid, null);
    }
    return isValid;
  }
  function validateSignupConfirm(showError = true) {
    const group = document.getElementById('signupConfirmGroup');
    const passVal = signupPassword.value;
    const confirmVal = signupConfirmPassword.value;
    
    if (confirmVal === '') {
      if (showError) setFieldStatus(group, false, 'signupConfirmError', 'Confirm password is required.');
      return false;
    }
    const isValid = passVal === confirmVal;
    if (showError) {
      setFieldStatus(group, isValid, 'signupConfirmError', 'Passwords do not match.');
    }
    return isValid;
  }
  function validateTerms(showError = true) {
    const group = termsCheck.closest('.checkbox-group');
    const isValid = termsCheck.checked;
    
    if (showError) {
      const errorMsg = document.getElementById('termsError');
      if (isValid) {
        group.classList.remove('invalid');
        errorMsg.style.display = 'none';
      } else {
        group.classList.add('invalid');
        errorMsg.style.display = 'block';
      }
    }
    return isValid;
  }
  /* --- Event Listeners for Real-time Validations --- */
  // Sign In inputs
  loginEmail.addEventListener('input', () => {
    if (touchedFields.has('loginEmail')) validateLoginEmail(true);
  });
  loginEmail.addEventListener('blur', () => {
    touchedFields.add('loginEmail');
    validateLoginEmail(true);
  });
  
  loginPassword.addEventListener('input', () => {
    if (touchedFields.has('loginPassword')) validateLoginPassword(true);
  });
  loginPassword.addEventListener('blur', () => {
    touchedFields.add('loginPassword');
    validateLoginPassword(true);
  });
  // Sign Up inputs
  signupName.addEventListener('input', () => {
    if (touchedFields.has('signupName')) validateSignupName(true);
  });
  signupName.addEventListener('blur', () => {
    touchedFields.add('signupName');
    validateSignupName(true);
  });
  signupEmail.addEventListener('input', () => {
    if (touchedFields.has('signupEmail')) validateSignupEmail(true);
  });
  signupEmail.addEventListener('blur', () => {
    touchedFields.add('signupEmail');
    validateSignupEmail(true);
  });
  signupPhone.addEventListener('input', () => {
    if (touchedFields.has('signupPhone')) validateSignupPhone(true);
  });
  signupPhone.addEventListener('blur', () => {
    touchedFields.add('signupPhone');
    validateSignupPhone(true);
  });
  signupPassword.addEventListener('input', (e) => {
    const val = e.target.value;
    updatePasswordStrength(val);
    if (touchedFields.has('signupPassword')) {
      validateSignupPassword(true);
      if (signupConfirmPassword.value) validateSignupConfirm(true);
    }
  });
  signupPassword.addEventListener('blur', () => {
    touchedFields.add('signupPassword');
    validateSignupPassword(true);
  });
  signupConfirmPassword.addEventListener('input', () => {
    if (touchedFields.has('signupConfirm')) validateSignupConfirm(true);
  });
  signupConfirmPassword.addEventListener('blur', () => {
    touchedFields.add('signupConfirm');
    validateSignupConfirm(true);
  });
  termsCheck.addEventListener('change', () => {
    validateTerms(true);
  });
  /* ==========================================================================
     Submission Handlers
     ========================================================================== */
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Touch all login fields to trigger validation display
    touchedFields.add('loginEmail');
    touchedFields.add('loginPassword');
    
    const isEmailValid = validateLoginEmail(true);
    const isPassValid = validateLoginPassword(true);
    if (isEmailValid && isPassValid) {
      // Show Success Modal
      successTitle.textContent = "Welcome Back!";
      successMessage.innerHTML = `You have successfully signed in as <strong style="color:var(--success)">${loginEmail.value}</strong>. Redirecting you to your workspace...`;
      successOverlay.classList.add('show');
      
      resetFormErrors(loginForm);
    }
  });
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Touch all signup fields to trigger validation display
    touchedFields.add('signupName');
    touchedFields.add('signupEmail');
    touchedFields.add('signupPhone');
    touchedFields.add('signupPassword');
    touchedFields.add('signupConfirm');
    const isNameValid = validateSignupName(true);
    const isEmailValid = validateSignupEmail(true);
    const isPhoneValid = validateSignupPhone(true);
    const isPassValid = validateSignupPassword(true);
    const isConfirmValid = validateSignupConfirm(true);
    const isTermsValid = validateTerms(true);
    if (isNameValid && isEmailValid && isPhoneValid && isPassValid && isConfirmValid && isTermsValid) {
      // Show Success Modal
      successTitle.textContent = "Account Created!";
      successMessage.innerHTML = `Welcome to Aura, <strong style="color:var(--success)">${signupName.value}</strong>! Your account has been registered. An verification link has been sent to <strong>${signupEmail.value}</strong>.`;
      successOverlay.classList.add('show');
      
      resetFormErrors(signupForm);
    }
  });
  // Success Modal Close Handler
  successCloseBtn.addEventListener('click', () => {
    successOverlay.classList.remove('show');
    // Default action: transition back to login tab if signup was successful
    if (successTitle.textContent === "Account Created!") {
      switchTab('login');
    }
  });
});