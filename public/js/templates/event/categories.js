'use strict';

export default function renderCategories() {
    return `
        <div class="container-xxl px-md-5">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb pb-3">
                      <li class="breadcrumb-item"><a href="/events">Events</a></li>
                      <li class="breadcrumb-item active" aria-current="page">Categories</li>
                    </ol>
                </nav>

                <div class="row row-cols-2 row-cols-lg-6 g-2 g-lg-3 py-4">

                    <a href="/events/?category=Music" class="col text-center category-link">
                        <div class="category-img shadow">
                            <img src="/img/music.png" alt="Music" loading="lazy">
                        </div>
                        <div class="pt-1">Music</div>
                    </a>

                    <a href="/events/?category=${encodeURI('Arts and Crafts')}" class="col text-center category-link">
                        <div class="category-img shadow">
                            <img src="/img/arts_crafts.jpg" alt="Arts & Crafts" loading="lazy">
                        </div>
                        <div class="pt-1">Arts & Crafts</div>
                    </a>

                    <a href="/events/?category=${encodeURI('Food and Drink')}" class="col text-center category-link">
                        <div class="category-img shadow">
                            <img src="/img/food_drink.jpg" alt="Food & Drink" loading="lazy">
                        </div>
                        <div class="pt-1">Food & Drink</div>
                    </a>

                    <a href="/events/?category=${encodeURI('Sports and Fitness')}" class="col text-center category-link">
                        <div class="category-img shadow">
                            <img src="/img/sports_fitness.jpg" alt="Sports & Fitness" loading="lazy">
                        </div>
                        <div class="pt-1">Sports & Fitness</div>
                    </a>

                    <a href="/events/?category=Technology" class="col text-center category-link">
                        <div class="category-img shadow">
                            <img src="/img/technology.jpg" alt="Technology" loading="lazy">
                        </div>
                        <div class="pt-1">Technology</div>
                    </a>

                    <a href="/events/?category=${encodeURI('Business and Networking')}" class="col text-center category-link">
                        <div class="category-img shadow">
                            <img src="/img/business_networking.jpg" alt="Business & Networking" loading="lazy">
                        </div>
                        <div class="pt-1">Business & Networking</div>
                    </a>
                    
                    <a href="/events/?category=${encodeURI('Health and Wellness')}" class="col text-center category-link">
                        <div class="category-img shadow">
                            <img src="/img/health_wellness.jpg" alt="Health & Wellness" loading="lazy">
                        </div>
                        <div class="pt-1">Health & Wellness</div>
                    </a>

                    <a href="/events/?category=Education" class="col text-center category-link">
                        <div class="category-img shadow">
                            <img src="/img/education.png" alt="Education" loading="lazy">
                        </div>
                        <div class="pt-1">Education</div>
                    </a>

                    <a href="/events/?category=${encodeURI('Fashion and Beauty')}" class="col text-center category-link">
                        <div class="category-img shadow">
                            <img src="/img/fashion_beauty.jpg" alt="Fashion & Beauty" loading="lazy">
                        </div>
                        <div class="pt-1">Fashion & Beauty</div>
                    </a>

                    <a href="/events/?category=Gaming" class="col text-center category-link">
                        <div class="category-img shadow">
                            <img src="/img/gaming.jpg" alt="Gaming" loading="lazy">
                        </div>
                        <div class="pt-1">Gaming</div>
                    </a>

                    <a href="/events/?category=${encodeURI('Travel and Outdoor')}" class="col text-center category-link">
                        <div class="category-img shadow">
                            <img src="/img/travel_outdoor.jpg" alt="Travel & Outdoor" loading="lazy">
                        </div>
                        <div class="pt-1">Travel & Outdoor</div>
                    </a>

                    <a href="/events/?category=${encodeURI('Family and Kids')}" class="col text-center category-link">
                        <div class="category-img shadow">
                            <img src="/img/family_kids.jpg" alt="Family & Kids" loading="lazy">
                        </div>
                        <div class="pt-1">Family & Kids</div>
                    </a>

                    <a href="/events/?category=${encodeURI('Charity and Causes')}" class="col text-center category-link">
                        <div class="category-img shadow">
                            <img src="/img/charity_causes.jpg" alt="Charity & Causes" loading="lazy">
                        </div>
                        <div class="pt-1">Charity & Causes</div>
                    </a>

                    <a href="/events/?category=${encodeURI('Performing Arts')}" class="col text-center category-link">
                        <div class="category-img shadow">
                            <img src="/img/performing_arts.jpg" alt="Performing Arts" loading="lazy">
                        </div>
                        <div class="pt-1">Performing Arts</div>
                    </a>

                    <a href="/events/?category=${encodeURI('Film and Media')}" class="col text-center category-link">
                        <div class="category-img shadow">
                            <img src="/img/film_media.jpg" alt="Film & Media" loading="lazy">
                        </div>
                        <div class="pt-1">Film & Media</div>
                    </a>
            </div>
        </div>`
}