
        // Import Firebase functions (already imported in the head, but good practice for clarity in module scripts)
        import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const formTitle = document.getElementById('form-title');
        const toggleFormBtn = document.getElementById('toggle-form-btn');
        const toggleText = document.getElementById('toggle-text');

        const customModal = document.getElementById('custom-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const modalCloseBtn = document.getElementById('modal-close-btn');

        const suggestUsernameBtn = document.getElementById('suggest-username-btn');
        const usernameSuggestionsDiv = document.getElementById('username-suggestions');
        const usernameLoadingSpinner = document.getElementById('username-loading-spinner');
        const signupUsernameInput = document.getElementById('signup-username');

        // Function to show custom modal
        function showCustomModal(title, message) {
            modalTitle.textContent = title;
            modalMessage.textContent = message;
            customModal.classList.add('show');
        }

        // Function to hide custom modal
        modalCloseBtn.addEventListener('click', () => {
            customModal.classList.remove('show');
        });

        // Function to toggle between login and signup forms with transition
        toggleFormBtn.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default button behavior

            if (loginForm.classList.contains('form-visible')) {
                // Currently showing login, switch to signup
                loginForm.classList.remove('form-visible');
                loginForm.classList.add('form-hidden');

                setTimeout(() => {
                    signupForm.classList.remove('form-hidden');
                    signupForm.classList.add('form-visible');
                    formTitle.textContent = 'Sign Up';
                    toggleText.textContent = "Already have an account?";
                    toggleFormBtn.textContent = 'Login';
                }, 300); // Allow time for login form to hide
            } else {
                // Currently showing signup, switch to login
                signupForm.classList.remove('form-visible');
                signupForm.classList.add('form-hidden');

                setTimeout(() => {
                    loginForm.classList.remove('form-hidden');
                    loginForm.classList.add('form-visible');
                    formTitle.textContent = 'Login';
                    toggleText.textContent = "Don't have an account?";
                    toggleFormBtn.textContent = 'Sign up';
                }, 300); // Allow time for signup form to hide
            }
        });

        // Firebase Login
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            if (!window.auth) {
                showCustomModal('Error', 'Firebase Auth not initialized. Please try again.');
                return;
            }

            try {
                const userCredential = await signInWithEmailAndPassword(window.auth, email, password);
                console.log('User logged in:', userCredential.user);
                showCustomModal('Success', 'Logged in successfully!');
                // Redirect or update UI after successful login
            } catch (error) {
                console.error('Login error:', error);
                showCustomModal('Login Failed', `Error: ${error.message}`);
            }
        });

        // Firebase Signup
        signupForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;
            const username = document.getElementById('signup-username').value;

            if (password !== confirmPassword) {
                showCustomModal('Error', 'Passwords do not match!');
                return;
            }

            if (!window.auth || !window.db) {
                showCustomModal('Error', 'Firebase services not initialized. Please try again.');
                return;
            }

            try {
                const userCredential = await createUserWithEmailAndPassword(window.auth, email, password);
                const user = userCredential.user;
                console.log('User signed up:', user);

                // Store additional user data in Firestore (private data)
                const userId = user.uid;
                const userDocRef = doc(window.db, `artifacts/${__app_id}/users/${userId}/profile`, 'user_data'); // MANDATORY Firestore path for private data
                await setDoc(userDocRef, {
                    fullName: name,
                    email: email,
                    username: username,
                    createdAt: new Date().toISOString()
                });
                console.log('User profile saved to Firestore.');
                showCustomModal('Success', 'Account created and profile saved!');
                // Redirect or update UI after successful signup
            } catch (error) {
                console.error('Signup error:', error);
                showCustomModal('Signup Failed', `Error: ${error.message}`);
            }
        });

        // Gemini API integration for Username Suggestion
        suggestUsernameBtn.addEventListener('click', async () => {
            usernameSuggestionsDiv.innerHTML = ''; // Clear previous suggestions
            usernameLoadingSpinner.classList.remove('hidden'); // Show spinner

            const prompt = "Generate 3 unique, creative, and slightly tech-themed username suggestions. Avoid common names and simple numbers. Provide them as a comma-separated list.";

            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { contents: chatHistory };
            const apiKey = ""; // Leave as empty string, Canvas will provide it at runtime
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    const text = result.candidates[0].content.parts[0].text;
                    const suggestions = text.split(',').map(s => s.trim()); // Split by comma and trim whitespace

                    suggestions.forEach(suggestion => {
                        const suggestionItem = document.createElement('div');
                        suggestionItem.classList.add('cursor-pointer', 'hover:text-indigo-600', 'hover:underline', 'p-1', 'rounded-md', 'hover:bg-gray-100');
                        suggestionItem.textContent = suggestion;
                        suggestionItem.addEventListener('click', () => {
                            signupUsernameInput.value = suggestion; // Populate input with clicked suggestion
                        });
                        usernameSuggestionsDiv.appendChild(suggestionItem);
                    });
                } else {
                    showCustomModal('Error', 'Could not generate username suggestions. Please try again.');
                    console.error('Gemini API response structure unexpected:', result);
                }
            } catch (error) {
                showCustomModal('Error', 'Failed to connect to the suggestion service. Please check your network.');
                console.error('Error calling Gemini API:', error);
            } finally {
                usernameLoadingSpinner.classList.add('hidden'); // Hide spinner
            }
        });
