let restaurants,
neighborhoods,
cuisines
var map
var markers = []


/**
	* Fetch neighborhoods and cuisines as soon as the page is loaded.
*/
document.addEventListener('DOMContentLoaded', (event) => {

	fetchNeighborhoods();
	fetchCuisines();
    
	

});

swap_map = () => {    

if (document.getElementById('map').style.display === 'none')      
{        
document.getElementById('map').style.display = 'block'        
document.getElementById('static_map').style.display = 'none' 

}    
}


/**
	* Fetch all neighborhoods and set their HTML.
*/
fetchNeighborhoods = () => {
	DBHelper.fetchNeighborhoods((error, neighborhoods) => {		
			self.neighborhoods = neighborhoods;
			fillNeighborhoodsHTML();
		
	})
}


/**
	* Set neighborhoods HTML.
*/
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
	const select = document.getElementById('neighborhoods-select');
	
	neighborhoods.forEach(neighborhood => {
		const option = document.createElement('option');
		option.setAttribute('tabindex', 0);
		option.setAttribute('aria-label', neighborhood);
		option.innerHTML = neighborhood;
		option.value = neighborhood;
		select.append(option);
	});
}

/**
	* Fetch all cuisines and set their HTML.
*/
fetchCuisines = () => {
	DBHelper.fetchCuisines((error, cuisines) => {
		if (error) { // Got an error!
			console.error(error);
			} else {
			self.cuisines = cuisines;
			fillCuisinesHTML();
		}
		});
}

/**
	* Set cuisines HTML.
*/
fillCuisinesHTML = (cuisines = self.cuisines) => {
	const select = document.getElementById('cuisines-select');
	
	cuisines.forEach(cuisine => {
		const option = document.createElement('option');
		option.setAttribute = ('role', 'option');
		option.setAttribute = ('tabindex', '0');
		option.innerHTML = cuisine;
		option.value = cuisine;
		select.append(option);
	});
}

/* Initialize Google map, called from HTML.
*/
window.initMap = () => {
	let loc = {
		lat: 40.722216,
		lng: -73.987501
	};
	self.map = new google.maps.Map(document.getElementById('map'), {
		zoom: 12,
		center: loc,
		scrollwheel: false
	});
	updateRestaurants();
}

/**
	* Initialize Google map, called from HTML from both index and restaurant page


/*window.initMap = () => {

  if(!document.getElementById('filter-results')){
    fetchRestaurantFromURL((restaurant) => {
    if (!restaurant) { // Got an error!
      console.error("error: restaurant not found");
      } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    } 
  });
  }else{
  	//console.error("gaat mis");
    let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();

  }
  
}*/

/**
	* Update page and map for current restaurants.
*/
updateRestaurants = () => {
	const cSelect = document.getElementById('cuisines-select');
	const nSelect = document.getElementById('neighborhoods-select');
	
	const cIndex = cSelect.selectedIndex;
	const nIndex = nSelect.selectedIndex;
	
	const cuisine = cSelect[cIndex].value;
	const neighborhood = nSelect[nIndex].value;
	
	DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
		if (error) { // Got an error!
			console.error(error);
			} else {
			resetRestaurants(restaurants);
			fillRestaurantsHTML();

		}
	})

}

/**
	* Clear current restaurants, their HTML and remove their map markers.
*/
resetRestaurants = (restaurants) => {
	// Remove all restaurants
	self.restaurants = [];
	const ul = document.getElementById('restaurants-list');
	ul.innerHTML = '';
	
	// Remove all map markers
	self.markers.forEach(m => m.setMap(null));
	self.markers = [];
	self.restaurants = restaurants;

}

/**
	* Create all restaurants HTML and add them to the webpage.
*/
fillRestaurantsHTML = (restaurants = self.restaurants) => {
	const ul = document.getElementById('restaurants-list');
	restaurants.forEach(restaurant => {
		ul.append(createRestaurantHTML(restaurant));
	});
	addMarkersToMap();
	var myLazyLoad = new LazyLoad();
}

/**
	* Create restaurant HTML.
*/

createRestaurantHTML = (restaurant) => {
	
	const li = document.createElement('li');
	li.className='restaurant-listing';
		
	
	const name = document.createElement('h3');
	name.setAttribute('tabindex', '0');

//create favorite button
	const favorite = document.createElement('span');
		favorite.innerHTML='&#9825;'
		favorite.setAttribute('class', 'favorite_button');

		favorite.setAttribute('class', "is"+restaurant.is_favorite);
		favorite.onclick= function(){
			
			const setNewStatus=!restaurant.is_favorite;	
			DBHelper.setStatusFav(restaurant.id, setNewStatus);
			restaurant.is_favorite=setNewStatus;

			setFavIcon(favorite, setNewStatus, restaurant);

		}
		setFavIcon(favorite, restaurant.is_favorite, restaurant);
	

	name.innerHTML = restaurant.name;
	name.append(favorite);
	li.append(name);
	

	
	const picture = document.createElement('picture');
	
	 const source = document.createElement('source');
	source.setAttribute('class', 'lazy');
	source.media='(max-width: 501px), (min-width: 502px), (min-width:700px), (min-width: 950px)';
	source.sizes='(max-width: 501px) 200px, 100vw, (min-width: 502px) 550px, 100vw, (min-width:700px) 350px, 550px, 100vw, (min-width: 950px) 350px, 550px, 100vw' ;
	source.setAttribute('data-srcset','./images/'+restaurant.id+'-small.webp 200w, ./images/'+restaurant.id+'-medium.webp 350w,'
	+ '/images/'+restaurant.id+'-large.webp 550w, ./images/'+restaurant.id+'-large7.webp 700w, '
	+'./images/'+restaurant.id+'-medium.webp 350w, ./images/'+restaurant.id+'-large.webp 550w, ./images/'+restaurant.id+'-large7.webp 700w ');

	// source.srcset='./images/'+restaurant.id+'-small.webp 200w, ./images/'+restaurant.id+'-medium.webp 350w, ';
	// source.srcset +='./images/'+restaurant.id+'-large.webp 550w, ./images/'+restaurant.id+'-large7.webp 700w, ';
	// source.srcset +='./images/'+restaurant.id+'-medium.webp 350w, ./images/'+restaurant.id+'-large.webp 550w, ./images/'+restaurant.id+'-large7.webp 700w ';
	// picture.append(source);
	picture.append(source);
	const sourceL = document.createElement('source');
	sourceL.media='(max-width: 501px), (min-width: 502px), (min-width:700px), (min-width: 950px)';
	sourceL.sizes='(max-width: 501px) 200px, 100vw, (min-width: 502px) 550px, 100vw, (min-width: 700px) 350px, 550px, 100vw, (min-width: 950px) 350px, 550px, 100vw';
	/*sourceL.srcset='./images/'+restaurant.id+'-medium.jpg 200w, ./images/'+restaurant.id+'-large.jpg 350w, ';
	sourceL.srcset +='./images/'+restaurant.id+'-large.jpg 550w, ./images/'+restaurant.id+'-large7.jpg 700w, ';
	sourceL.srcset +='./images/'+restaurant.id+'-medium.webp 350w, ./images/'+restaurant.id+'-large.jpg 550w, ./images/'+restaurant.id+'-large7.jpg 700w ';
*/
	sourceL.setAttribute('class', 'lazy');
	sourceL.setAttribute('data-srcset','./images/'+restaurant.id+'-medium.jpg 200w, ./images/'+restaurant.id+'-large.jpg 350w, '
	+ './images/'+restaurant.id+'-large.jpg 550w, ./images/'+restaurant.id+'-large7.jpg 700w, '
	+ './images/'+restaurant.id+'-medium.webp 350w, ./images/'+restaurant.id+'-large.jpg 550w, ./images/'+restaurant.id+'-large7.jpg 700w ');


	picture.append(sourceL);
	const image = document.createElement('img');
	image.className = 'restaurant-img';
	image.alt = 'restaurant '+restaurant.name;
	image.setAttribute('data-src', DBHelper.imageUrlForRestaurant(restaurant));
	picture.append(image);
	li.append(picture);


		
	
	const neighborhood = document.createElement('p');
    neighborhood.setAttribute('tabindex', '0');
	neighborhood.setAttribute('aria-label', 'neighborhood:'+restaurant.neighborhood);
	neighborhood.className='neighborhood';
	neighborhood.innerHTML = restaurant.neighborhood;
	li.append(neighborhood);
	
	const address = document.createElement('p');
	address.className='address';
	address.setAttribute('aria-label', 'Address:'+restaurant.address);
	address.setAttribute('tabindex', '0');
	address.innerHTML = restaurant.address;
	li.append(address);
	
	const more = document.createElement('a');
	more.setAttribute('role', 'button')
	more.setAttribute('aria-label', 'View details on '+restaurant.name);
	more.innerHTML = "View details";
	more.href = DBHelper.urlForRestaurant(restaurant);
	li.append(more);
	
	return li
}
setFavIcon= (favorite, status, restaurant)=>{
	
	if(!status){

		favorite.innerHTML='&#9825;';
		favorite.setAttribute('title', 'mark as favorite');
		favorite.setAttribute('aria-label', 'mark '+restaurant.name+ ' as favourite');
		//favorite.remove('class', 'istrue');
		favorite.setAttribute('class', 'isfalse');

	}else{

		favorite.innerHTML='&#9829;';
	//	favorite.remove('class', 'isfalse');
	favorite.setAttribute('title', 'remove from your favorites');
		favorite.setAttribute('class', 'istrue');
		favorite.setAttribute('aria-label', 'remove '+restaurant.name+ ' as favourite');
	}
}

/*Lazy load*/
const preloadImage = el => {

 const srcset = el.getAttribute('data-srcset');
 if (!srcset) {
   return;
 }

 el.srcset = srcset;
 el.classList.add('fade');
 el.removeAttribute('data-srcset');

};




/**
	* Add markers for current restaurants to the map.
*/
addMarkersToMap = (restaurants = self.restaurants) => {
	restaurants.forEach(restaurant => {
		// Add marker to the map
		const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
		google.maps.event.addListener(marker, 'click', () => {
			window.location.href = marker.url
		});
		self.markers.push(marker);
	});
}


if ('serviceWorker' in navigator) {
	window.addEventListener('load', function() {
		navigator.serviceWorker.register('sw.js').then(function(registration) {
			// Registration was successful
			console.log('ServiceWorker registration successful with scope: ', registration.scope);
			}, function(err) {
			// registration failed :(
			console.log('ServiceWorker registration failed: ', err);
		});
	});
}



