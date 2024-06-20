'use strict';

function renderRegister() {
    return `
        <div class="container registration-container">
        <div class="row justify-content-center">
        <div class="col-md-6">
        <h2 class="text-center mb-4">Register</h2>
                    <form id="registration-form">
                        <div class="form-group">
                            <label for="role" class="pt-3 pb-1">Role</label>
                            <select id="role" class="form-select form-select-md" aria-label="Small select example">
                                <option value="participant">Participant</option>
                                <option value="organizer">Organizer</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="first-name" class="pt-3 pb-1">First Name</label>
                            <small id="first-name-error" class="form-text text-danger"></small>
                            <input type="text" class="form-control" id="first-name" name="firstName"
                                placeholder="Enter your first name" required>
                        </div>
                        <div class="form-group">
                            <label for="last-name" class="pt-3 pb-1">Last Name</label>
                            <small id="last-name-error" class="form-text text-danger"></small>
                            <input type="text" class="form-control" id="last-name" name="last-name"
                                placeholder="Enter your last name" required>
                        </div>
                        <div class="form-group">
                            <label for="email" class="pt-3 pb-1">Email Address</label>
                            <small id="email-error" class="form-text text-danger"></small>
                            <input type="email" class="form-control" id="email" name="email"
                                placeholder="Enter your email address" required>
                        </div>
                        <div class="form-group">
                            <label for="password" class="pt-3 pb-1">Password</label>
                            <small id="password-error" class="form-text text-danger"></small>
                            <input type="password" class="form-control" id="password" name="password"
                                placeholder="Enter your password" minlenght="8" required>
                        </div>
                        <div class="form-group">
                            <label for="confirm-password" class="pt-3 pb-1">Confirm Password</label>
                            <small id="confirm-password-error" class="form-text text-danger"></small>
                            <input type="password" class="form-control" id="confirm-password" placeholder="Confirm your password" minlenght="8" required>
                            </div>
                        <div class="form-group">
                            <label for="profile-picture" class="pt-3 pb-1">Profile Picture</label>
                            <div class="input-group mb-3">
                                <input type="file" class="form-control" id="profile-picture" accept=".jpg, .jpeg, .png">
                            </div>
                        </div>
                        <div class="row justify-content-between">
                            <button type="submit" class="btn btn-primary mt-5 mb-3" id="register-button" disabled>Register</button>
                            <a href="/auth/login" class="btn btn-outline-primary mb-5">Login</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

export default renderRegister;