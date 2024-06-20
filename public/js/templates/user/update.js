'use strict';

export default function (user) {
    return `
        <div class="container mt-5">
            <div class="row">
                <div class="col-md-3 text-center">
                    <div class="profile-picture-wrapper text-center mb-5">
                        <img id="profile-picture" src="${user.profilePicture || '/users/default.png'}" alt="Profile Picture" class="profile-picture">
                        <br>
                        <input type="file" id="profile-picture-input" accept=".jpg, .jpeg, .png">
                        <div class="btn-group my-2" role="group">
                            <button type="button" id="profile-picture-edit" class="btn btn-primary"><i class="bi bi-pencil-square"></i></button>
                            <button type="button" id="profile-picture-delete" class="btn btn-danger"><i class="bi bi-trash"></i></button>
                        </div>
                    </div>
                    <button type="button" class="btn btn-danger mt-3" data-bs-toggle="modal" data-bs-target="#deleteModal">
                        Delete Profile
                    </button>
                </div>
                <div class="col-md-9">
                    <form>
                        <div class="form-group my-3">
                            <label class="mt-2 mb-1" for="first-name-input">First Name</label>
                            <small id="first-name-error" class="form-text text-danger"></small>
                            <div class="input-group">
                                <input type="text" class="form-control" id="first-name-input" name="first-name" value="${user.firstName}" disabled>
                                <div class="input-group-append mx-1">
                                    <button id="first-name-edit" type="button" class="btn btn-primary edit-button"><i class="bi bi-pencil-square"></i></button>
                                    <button id="first-name-save" type="button" class="btn btn-success edit-button"><i class="bi bi-check-circle-fill"></i></button>
                                </div>
                            </div>
                        </div>
                        <div class="form-group my-3">
                            <label class="mt-2 mb-1" for="last-name-input">Last Name</label>
                            <small id="last-name-error" class="form-text text-danger"></small>
                            <div class="input-group">
                                <input type="text" class="form-control" id="last-name-input" name="last-name" value="${user.lastName}" disabled>
                                <div class="input-group-append mx-1">
                                    <button id="last-name-edit" type="button" class="btn btn-primary edit-button"><i class="bi bi-pencil-square"></i></button>
                                    <button id="last-name-save" type="button" class="btn btn-success edit-button"><i class="bi bi-check-circle-fill"></i></button>
                                </div>
                            </div>
                        </div>
                        <div class="form-group my-3">
                            <label class="mt-2 mb-1" for="email-input">Email</label>
                            <small id="email-error" class="form-text text-danger"></small>
                            <div class="input-group">
                                <input type="email" class="form-control" id="email-input" name="email" value="${user.email}" disabled>
                                <div class="input-group-append mx-1">
                                    <button id="email-edit" type="button" class="btn btn-primary edit-button"><i class="bi bi-pencil-square"></i></button>
                                    <button id="email-save" type="button" class="btn btn-success edit-button"><i class="bi bi-check-circle-fill"></i></button>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="mt-2 mb-1" for="password-input">Password</label>
                            <div class="input-group">
                                <input type="password" id="password-input" class="form-control" name="password" value="********" disabled>
                                <div class="input-group-append mx-1">
                                    <button id="password-edit" type="button" class="btn btn-primary edit-button" data-bs-toggle="modal" data-bs-target="#changePasswordModal"><i class="bi bi-pencil-square"></i></button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="modal fade" id="changePasswordModal" tabindex="-1" aria-labelledby="changePasswordModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="changePasswordModalLabel">Change Password</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="change-password-form">
                            <div class="mb-3">
                                <label for="old-password" class="form-label">Old Password</label>
                                <small id="old-password-error" class="form-text text-danger"></small>
                                <input type="password" class="form-control" id="old-password" name="old-password" required>
                            </div>
                            <div class="mb-3">
                                <label for="new-password" class="form-label">New Password</label>
                                <small id="new-password-error" class="form-text text-danger"></small>
                                <input type="password" class="form-control" id="new-password" name="new-password" required>
                            </div>
                            <div class="mb-3">
                                <label for="confirm-password" class="form-label">Confirm Password</label>
                                <small id="confirm-password-error" class="form-text text-danger"></small>
                                <input type="password" class="form-control" id="confirm-password" name="confirm-password" required>
                            </div>
                            <div class="d-flex justify-content-end">
                                <button id="change-password-button" class="btn btn-primary" data-bs-dismiss="modal" disabled>Change Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="deleteModal" tabindex="-1" role="dialog" aria-labelledby="deleteModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="deleteModalLabel">Delete User Profile</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        Are you sure you want to delete your user profile?
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" id="delete-profile-button" data-bs-dismiss="modal">Delete</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}
