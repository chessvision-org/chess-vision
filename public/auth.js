(function () {
  'use strict';

  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var MIN_PASSWORD_LENGTH = 8;

  var RULES = [
    { label: 'At least 8 characters', test: function (v) { return v.length >= MIN_PASSWORD_LENGTH; } },
    { label: 'Uppercase letter (A–Z)', test: function (v) { return /[A-Z]/.test(v); } },
    { label: 'Number (0–9)', test: function (v) { return /[0-9]/.test(v); } },
    { label: 'Special character (!@#…)', test: function (v) { return /[^A-Za-z0-9]/.test(v); } },
  ];

  var LABELS = ['Weak', 'Fair', 'Good', 'Strong'];

  var LOADING_LABELS = {
    'sign-in': 'Signing in…',
    'sign-up': 'Creating account…',
    'forgot-password': 'Sending…',
    mfa: 'Verifying…',
  };

  var SESSION_KEY = 'sb-chess-vision-auth-token';

  function safeJSONParse(text, fallback) {
    try { return JSON.parse(text); } catch (e) { return fallback; }
  }

  function getSession() {
    var stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    var session = safeJSONParse(stored, null);
    return session && session.access_token ? session : null;
  }

  function decodeJwtPayload(token) {
    try {
      var base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      var json = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return safeJSONParse(json, null);
    } catch (e) {
      return null;
    }
  }

  function getAuthErrorMessage(error) {
    if (error instanceof Error) return error.message;
    if (error && typeof error === 'object' && error.message) return String(error.message);
    return 'Authentication failed. Please try again.';
  }

  function extractApiError(data) {
    if (!data) return null;
    var msg = data.message || data.error_description || data.msg || data.code || data.details || data.hint;
    return msg ? { message: String(msg) } : null;
  }

  var auth = (function () {
    var root = document.querySelector('[data-auth-root]');
    var url = root ? (root.getAttribute('data-supabase-url') || '') : '';
    var anonKey = root ? (root.getAttribute('data-supabase-anon-key') || '') : '';

    function baseHeaders(session) {
      var headers = { apikey: anonKey, 'Content-Type': 'application/json' };
      if (session && session.access_token) {
        headers.Authorization = 'Bearer ' + session.access_token;
      } else {
        headers.Authorization = 'Bearer ' + anonKey;
      }
      return headers;
    }

    function request(path, options) {
      var session = getSession();
      return fetch(url + path, {
        method: options.method || 'GET',
        headers: Object.assign(baseHeaders(session), options.headers || {}),
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      });
    }

    return {
      signUp: function (email, password) {
        return request('/auth/v1/signup', {
          method: 'POST',
          body: { email: email, password: password },
        }).then(handleJson);
      },
      signInWithPassword: function (email, password) {
        return request('/auth/v1/token?grant_type=password', {
          method: 'POST',
          body: { email: email, password: password },
        }).then(handleJson);
      },
      resetPasswordForEmail: function (email) {
        return request('/auth/v1/recover', {
          method: 'POST',
          headers: { 'redirect-to': window.location.origin + '/auth/reset-password' },
          body: { email: email, gotrue_meta_security: {} },
        }).then(handleJson);
      },
      getUser: function () {
        return request('/auth/v1/user', { method: 'GET' }).then(handleJson);
      },
      listFactors: function () {
        return this.getUser().then(function (res) {
          if (res.error) return res;
          var all = (res.data && res.data.factors) || [];
          var totp = all.filter(function (f) {
            return f.factor_type === 'totp' && f.status === 'verified';
          });
          return { data: { all: all, totp: totp }, error: null };
        });
      },
      mfaChallenge: function (factorId) {
        return request('/auth/v1/factors/' + factorId + '/challenge', {
          method: 'POST',
          body: {},
        }).then(handleJson);
      },
      mfaVerify: function (factorId, challengeId, code) {
        return request('/auth/v1/factors/' + factorId + '/verify', {
          method: 'POST',
          body: { challenge_id: challengeId, code: code },
        }).then(handleJson);
      },
      verifyRecoveryCode: function (code) {
        return request('/rest/v1/rpc/verify_recovery_code', {
          method: 'POST',
          body: { code: code },
        }).then(handleJson);
      },
      getAuthenticatorAssuranceLevel: function () {
        var session = getSession();
        if (!session) return Promise.resolve({ data: null, error: { message: 'No session' } });

        var payload = decodeJwtPayload(session.access_token);
        var aal = payload && payload.aal === 'aal2' ? 'aal2' : 'aal1';

        return this.getUser().then(function (res) {
          if (res.error) return { data: null, error: res.error };
          var factors = (res.data && res.data.factors) || [];
          var hasVerified = factors.some(function (f) { return f.status === 'verified'; });
          return {
            data: {
              currentLevel: aal,
              nextLevel: hasVerified ? 'aal2' : aal,
              currentAuthenticationMethods: payload && payload.amr ? payload.amr : [],
            },
            error: null,
          };
        });
      },
    };

    function handleJson(res) {
      if (res.status === 204) {
        return { data: null, error: null };
      }
      return res.json().then(function (data) {
        if (!res.ok || data.error) {
          var apiError = extractApiError(data.error || data);
          return { data: null, error: apiError || { message: 'Request failed (' + res.status + ')' } };
        }
        return { data: data, error: null };
      }).catch(function () {
        return { data: null, error: { message: 'Request failed (' + res.status + ')' } };
      });
    }
  })();

  function persistSession(session) {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  // ===== Generic field helpers =====

  function setFieldError(form, field, message) {
    var input = form.querySelector('[data-auth-field="' + field + '"]');
    var errorEl = form.querySelector('[data-field-error="' + field + '"]');
    if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (errorEl) {
      if (message) {
        errorEl.textContent = message;
        errorEl.hidden = false;
      } else {
        errorEl.hidden = true;
        errorEl.textContent = '';
      }
    }
  }

  function setFormError(form, message) {
    var alert = form.querySelector('[data-form-error]');
    if (!alert) return;
    if (message) {
      alert.textContent = message;
      alert.hidden = false;
    } else {
      alert.hidden = true;
      alert.textContent = '';
    }
  }

  function setSubmitting(form, isSubmitting) {
    var btn = form.querySelector('[data-submit-btn]');
    if (!btn) return;
    btn.disabled = isSubmitting;
    var spinner = btn.querySelector('[data-spinner]');
    var label = btn.querySelector('[data-submit-label]');
    var loadingLabel = LOADING_LABELS[btn.getAttribute('data-submit-btn')] || '';
    if (spinner) spinner.hidden = !isSubmitting;
    if (label) {
      if (isSubmitting) {
        label.setAttribute('data-rest-label', label.textContent);
        if (loadingLabel) label.textContent = loadingLabel;
      } else {
        var rest = label.getAttribute('data-rest-label');
        if (rest) label.textContent = rest;
      }
    }
  }

  // ===== Sign-in =====

  function initSignIn(form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var emailInput = form.querySelector('[data-auth-field="email"]');
      var passwordInput = form.querySelector('[data-auth-field="password"]');
      var email = emailInput.value.trim();
      var password = passwordInput.value;

      var valid = true;
      setFieldError(form, 'email', '');
      setFieldError(form, 'password', '');
      setFormError(form, '');

      if (!email) { setFieldError(form, 'email', 'Email is required.'); valid = false; }
      else if (!EMAIL_PATTERN.test(email)) { setFieldError(form, 'email', 'Please enter a valid email address.'); valid = false; }

      if (!password) { setFieldError(form, 'password', 'Password is required.'); valid = false; }

      if (!valid) return;

      setSubmitting(form, true);
      auth.signInWithPassword(email, password).then(function (res) {
        if (res.error) {
          setFormError(form, getAuthErrorMessage(res.error));
          return;
        }
        persistSession(res.data);

        return auth.getAuthenticatorAssuranceLevel().then(function (aalRes) {
          if (!aalRes.error && aalRes.data &&
              aalRes.data.nextLevel === 'aal2' && aalRes.data.nextLevel !== aalRes.data.currentLevel) {
            window.location.href = '/auth/mfa';
            return;
          }
          window.location.href = '/';
        });
      }).catch(function (err) {
        setFormError(form, getAuthErrorMessage(err));
      }).then(function () {
        setSubmitting(form, false);
      });
    });
  }

  // ===== Sign-up =====

  function analysePassword(value) {
    var passedRules = RULES.map(function (r) { return r.test(value); });
    return { score: passedRules.filter(Boolean).length, passedRules: passedRules };
  }

  function initStrengthMeter(form) {
    var passwordInput = form.querySelector('[data-auth-field="password"]');
    var meter = form.querySelector('[data-strength-meter]');
    var info = form.querySelector('[data-strength-info]');
    var label = form.querySelector('[data-strength-label]');
    var missing = form.querySelector('[data-strength-missing]');
    var bars = form.querySelectorAll('[data-strength-bar]');
    if (!passwordInput || !meter) return;

    passwordInput.addEventListener('input', function () {
      var value = passwordInput.value;
      if (!value) { meter.hidden = true; if (info) info.hidden = true; return; }

      var analysis = analysePassword(value);
      meter.hidden = false;
      if (label) label.hidden = false;

      bars.forEach(function (bar, i) {
        var level = i < analysis.score ? String(analysis.score) : '';
        bar.setAttribute('data-level', level);
      });
      meter.setAttribute('aria-valuenow', String(analysis.score));

      if (info) info.hidden = false;
      if (label) {
        label.textContent = analysis.score > 0 ? LABELS[analysis.score - 1] : '';
        label.setAttribute('data-level', analysis.score > 0 ? String(analysis.score) : '');
      }
      if (missing) {
        var failed = RULES.filter(function (_, i) { return !analysis.passedRules[i]; });
        missing.textContent = failed.length > 0 && analysis.score < 4
          ? 'Missing: ' + failed.map(function (r) { return r.label; }).join(' · ')
          : '';
      }
    });
  }

  function initSignUp(form) {
    initStrengthMeter(form);
    var emailInput = form.querySelector('[data-auth-field="email"]');
    var passwordInput = form.querySelector('[data-auth-field="password"]');
    var confirmInput = form.querySelector('[data-auth-field="confirm"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = emailInput.value.trim();
      var password = passwordInput.value;
      var confirm = confirmInput.value;

      var valid = true;
      setFieldError(form, 'email', '');
      setFieldError(form, 'password', '');
      setFieldError(form, 'confirm', '');
      setFormError(form, '');

      if (!email) { setFieldError(form, 'email', 'Email is required.'); valid = false; }
      else if (!EMAIL_PATTERN.test(email)) { setFieldError(form, 'email', 'Please enter a valid email address.'); valid = false; }

      if (!password) { setFieldError(form, 'password', 'Password is required.'); valid = false; }
      else if (password.length < MIN_PASSWORD_LENGTH) {
        setFieldError(form, 'password', 'Password must be at least ' + MIN_PASSWORD_LENGTH + ' characters.');
        valid = false;
      }

      if (confirm !== password) { setFieldError(form, 'confirm', 'Passwords do not match.'); valid = false; }

      if (!valid) return;

      setSubmitting(form, true);
      auth.signUp(email, password).then(function (res) {
        if (res.error) {
          setFieldError(form, 'email', getAuthErrorMessage(res.error));
          return;
        }
        var user = res.data && (res.data.user || res.data);
        if (user && Array.isArray(user.identities) && user.identities.length === 0) {
          setFieldError(form, 'email', 'An account with this email already exists.');
          return;
        }
        if (res.data && res.data.session) persistSession(res.data.session);
        var success = document.querySelector('[data-signup-success]');
        var successForm = document.querySelector('[data-auth-form="sign-up"]');
        if (success && successForm) {
          successForm.hidden = true;
          success.hidden = false;
        }
      }).catch(function (err) {
        setFieldError(form, 'email', getAuthErrorMessage(err));
      }).then(function () {
        setSubmitting(form, false);
      });
    });
  }

  // ===== Forgot password =====

  function initForgot(form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var emailInput = form.querySelector('[data-auth-field="email"]');
      var email = emailInput.value.trim();

      var valid = true;
      setFieldError(form, 'email', '');
      setFormError(form, '');

      if (!email) { setFieldError(form, 'email', 'Email is required.'); valid = false; }
      else if (!EMAIL_PATTERN.test(email)) { setFieldError(form, 'email', 'Please enter a valid email address.'); valid = false; }

      if (!valid) return;

      setSubmitting(form, true);
      auth.resetPasswordForEmail(email).then(function (res) {
        if (res.error) {
          setFieldError(form, 'email', getAuthErrorMessage(res.error));
          return;
        }
        var success = document.querySelector('[data-forgot-success]');
        if (success) { form.hidden = true; success.hidden = false; }
      }).catch(function (err) {
        setFieldError(form, 'email', getAuthErrorMessage(err));
      }).then(function () {
        setSubmitting(form, false);
      });
    });
  }

  // ===== MFA =====

  function initMfa(form) {
    var mode = 'totp';
    var codeInput = form.querySelector('[data-mfa-code]');
    var toggleBtn = document.querySelector('[data-mfa-toggle]');
    var titleEl = document.querySelector('[data-mfa-title]');
    var subtitleEl = document.querySelector('[data-mfa-subtitle]');
    var iconTotp = document.querySelector('[data-mfa-icon="totp"]');
    var iconBackup = document.querySelector('[data-mfa-icon="backup"]');

    function syncMode() {
      var isTotp = mode === 'totp';
      codeInput.inputMode = isTotp ? 'numeric' : 'text';
      codeInput.placeholder = isTotp ? '000000' : 'A1B2C3D4E5F6A7B8';
      codeInput.maxLength = isTotp ? 6 : 16;
      codeInput.value = '';
      if (titleEl) titleEl.textContent = isTotp ? 'Two-Factor Authentication' : 'Backup Code Verification';
      if (subtitleEl) subtitleEl.textContent = isTotp
        ? 'Enter the 6-digit code from your authenticator app.'
        : 'Enter one of your 16-character recovery codes.';
      if (iconTotp) iconTotp.hidden = !isTotp;
      if (iconBackup) iconBackup.hidden = isTotp;
      if (toggleBtn) toggleBtn.textContent = isTotp ? 'Use a backup code instead' : 'Use authenticator app';
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        mode = mode === 'totp' ? 'backup' : 'totp';
        setFormError(form, '');
        syncMode();
        codeInput.focus();
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var code = codeInput.value.trim();
      setFormError(form, '');
      if (!code) return;

      setSubmitting(form, true);

      var promise = mode === 'totp' ? verifyTotp(code) : verifyBackup(code);

      promise.then(function () {
        window.location.href = '/';
      }).catch(function (err) {
        setFormError(form, err.message || 'Verification failed.');
      }).then(function () {
        setSubmitting(form, false);
      });
    });

    function verifyTotp(code) {
      return auth.listFactors().then(function (res) {
        if (res.error) throw new Error(getAuthErrorMessage(res.error));
        var factor = (res.data && res.data.totp && res.data.totp[0]) || null;
        if (!factor) throw new Error('No verified TOTP factor found.');
        return auth.mfaChallenge(factor.id).then(function (challengeRes) {
          if (challengeRes.error || !challengeRes.data) throw new Error(getAuthErrorMessage(challengeRes.error) || 'Challenge failed.');
          return auth.mfaVerify(factor.id, challengeRes.data.id, code);
        }).then(function (verifyRes) {
          if (verifyRes.error || !verifyRes.data) throw new Error('Invalid verification code.');
          persistSession(verifyRes.data);
        });
      });
    }

    function verifyBackup(code) {
      return auth.verifyRecoveryCode(code.toUpperCase()).then(function (res) {
        if (res.error || !res.data) throw new Error('Invalid or already used backup code.');
      });
    }
  }

  // ===== Password visibility toggles =====

  function initPasswordToggles(root) {
    root.querySelectorAll('[data-password-toggle]').forEach(function (btn) {
      var input = btn.closest('.auth-password-wrap').querySelector('input');
      btn.addEventListener('click', function () {
        var isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        var showIcon = btn.querySelector('[data-toggle-icon="show"]');
        var hideIcon = btn.querySelector('[data-toggle-icon="hide"]');
        if (showIcon) showIcon.hidden = isHidden;
        if (hideIcon) hideIcon.hidden = !isHidden;
        btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
      });
    });
  }

  // ===== Init =====

  function init() {
    var root = document.querySelector('[data-auth-root]');
    if (!root) return;

    initPasswordToggles(root);

    var signInForm = document.querySelector('[data-auth-form="sign-in"]');
    var signUpForm = document.querySelector('[data-auth-form="sign-up"]');
    var forgotForm = document.querySelector('[data-auth-form="forgot-password"]');
    var mfaForm = document.querySelector('[data-auth-form="mfa"]');

    if (signInForm) initSignIn(signInForm);
    if (signUpForm) initSignUp(signUpForm);
    if (forgotForm) initForgot(forgotForm);
    if (mfaForm) initMfa(mfaForm);

    document.querySelectorAll('[data-submit-btn]').forEach(function (btn) {
      var label = btn.querySelector('[data-submit-label]');
      if (label) label.setAttribute('data-rest-label', label.textContent);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
