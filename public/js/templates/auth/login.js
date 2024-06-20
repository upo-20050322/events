'use strict';

function renderLogin() {
    return `
        <div class="container login-container">
            <div class="row justify-content-center">
                <div class="col-md-6 col-lg-4">
                    <h2 class="text-center m-4">Login</h2>
                    <form id="login-form">
                        <div class="form-group">
                            <label for="email" class="py-3">Email</label>
                            <small id="email-error" class="form-text text-danger"></small>
                            <input type="email" class="form-control" id="email" name="email" placeholder="Email" required>
                        </div>
                        <div class="form-group">
                            <label for="password" class="py-3">Password</label>
                            <small id="password-error" class="form-text text-danger"></small>
                            <input type="password" class="form-control" id="password" name="password" placeholder="Password" minlenght="8" required>
                        </div>
                        <div class="row justify-content-between ">
                            <button type="submit" class="btn btn-primary mt-5 mb-3" id="login-button" disabled>Login</button>
                            <a href="/auth/register" class="btn btn-outline-primary mb-5">Create an account</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

export default renderLogin;