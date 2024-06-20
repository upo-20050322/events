'use strict';

export default function renderAbout() {
    return `
    <section class="px-4 py-5 my-5 text-center">
        <img src="/img/publish_event.png" class="d-block mx-auto mb-4 img-fluid" alt="Publish your event for FREE" width="616" height="258" loading="lazy">
        <h1 class="display-5 fw-bold">About</h1>
        <div class="col-lg-6 mx-auto">
            <p class="lead my-4">The Events web app is a dynamic platform designed to streamline the creation and participation in various events. Users can assume the role of either an organizer or a participant. As an organizer, users have the ability to create events by providing essential details such as the title, description, category, price, location, date, and images. This comprehensive event creation process ensures that all necessary information is available to attract potential participants. On the other hand, participants can easily browse through available events, purchase tickets, and join the events of their interest. The app aims to facilitate a seamless and engaging experience for both organizers and participants, fostering a vibrant community centered around diverse events.</p>
            <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
                <a href="/events" class="btn btn-primary btn-lg">Explore Events</a>
            </div>
        </div>
    </section>`;
}
