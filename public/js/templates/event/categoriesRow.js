'use strict';

export default function renderCategoriesRow() {
    return `
    <div class="row row-cols-2 row-cols-lg-6 g-2 g-lg-3 py-4">
  
        <a href="/events/?category=Music" class="col text-center category-link">
            <div class="category-img shadow">
                <img src="/img/music.png" alt="Music" loading="lazy">
            </div>
            <div class="pt-1">Music</div>
        </a>
    
        <a href="/events/?category=${encodeURI('Food and Drink')}" class="col text-center category-link">
            <div class="category-img shadow">
                <img src="/img/food_drink.jpg" alt="Food and Drink" loading="lazy">
            </div>
            <div class="pt-1">Food and Drink</div>
        </a>
    
        <a href="/events/?category=${encodeURI('Sports and Fitness')}" class="col text-center category-link">
            <div class="category-img shadow">
                <img src="/img/sports_fitness.jpg" alt="Sports and Fitness" loading="lazy">
            </div>
            <div class="pt-1">Sports and Fitness</div>
        </a>
    
        <a href="/events/?category=Technology" class="col text-center category-link">
            <div class="category-img shadow">
                <img src="/img/technology.jpg" alt="Technology" loading="lazy">
            </div>
            <div class="pt-1">Technology</div>
        </a>
    
        <a href="/events/?category=${encodeURI('Performing Arts')}" class="col text-center category-link">
            <div class="category-img shadow">
                <img src="/img/performing_arts.jpg" alt="Performing Arts" loading="lazy">
            </div>
            <div class="pt-1">Performing Arts</div>
        </a>
    
        <a href="/events/categories" class="col text-center category-link">
            <div class="category-img shadow">
                <img src="/img/view_all.jpg" alt="View All Categories" loading="lazy">
            </div>
            <div class="pt-1">View All</div>
        </a>
    
    </div>`
}