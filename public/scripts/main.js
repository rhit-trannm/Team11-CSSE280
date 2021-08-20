/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author
 * PUT_YOUR_NAME_HERE
 */
/** namespace. */
var rhit = rhit || {};
// const cc = { lat: 40.116421, lng: -88.243385 };
let map;
let service;
let infowindow;
var script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyA5fKko1woHkr6_iPyhyd4u2vM5fHoaMXs&libraries=places&callback=initMap';
script.async = true;
var latitude;
var longitude;
var tempBlock = []
rhit.FB_KEY_UID = "userID";
rhit.FB_KEY_LOCATION = "Location";
rhit.FB_KEY_RestaurantBlock = "BlockedRestaurant";
rhit.FB_KEY_LAST_TOUCHED = "LastTouch";
rhit.FB_COLLECTION_USERS = "Users";
rhit.FbAuthManager = null;
rhit.UserInfoManager = null;
var locationLast;
var x = document.getElementById("demo");
let markerList = [];

function getLocation() {
	if (navigator.geolocation) {
		console.log("gettinglocations")
		navigator.geolocation.getCurrentPosition(savePosition);

	} else {
		x.innerHTML = "Geolocation is not supported by this browser.";
	}
}

function savePosition(position) {
	locationLast = [position.coords.latitude, position.coords.longitude];
}

function getLatLngByZipcode(zipcode) {
	var geocoder = new google.maps.Geocoder();
	var address = zipcode;
	geocoder.geocode({
		'address': 'zipcode ' + address
	}, function (results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			latitude = results[0].geometry.location.lat();
			longitude = results[0].geometry.location.lng();
			alert("Latitude: " + latitude + "\nLongitude: " + longitude);
		} else {
			alert("Request failed.")
		}
	});
}

function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}
window.initMap = function (locationLast, restaurantType) {
	if (!locationLast) {
		map = new google.maps.Map(document.getElementById("map"), {
			center: {
				lat: 39.2857,
				lng: -87.1926
			},
			zoom: 14,
			gestureHandling: "greedy",
		});
	} else {
		markerList = [];
		infowindow = new google.maps.InfoWindow();
		map = new google.maps.Map(document.getElementById("map"), {
			center: {
				lat: locationLast[0],
				lng: locationLast[1]
			},
			zoom: 12,
			gestureHandling: "greedy",
		});
		if (restaurantType) {
			const request = {
				type: "restaurant",
				radius: 1000,
				query: `${restaurantType}`,
				location: new google.maps.LatLng(locationLast[0], locationLast[1]),
				fields: ["name", "geometry", "types"],
			};
			service = new google.maps.places.PlacesService(map);
			service.textSearch(request, (results, status) => {
				tempBlock = Object.assign({}, rhit.UserInfoManager.getSnap().BlockedRestaurant);
				if (status === google.maps.places.PlacesServiceStatus.OK && results) {
					// for (let i = 0; i < results.length; i++) {

					// 	createMarker(results[i]);
					// 	if (tempBlock.hasOwnProperty(results[i].place_id)) {
					// 		if (tempBlock[results[i].place_id].ignore == true) {
					// 			console.log(markerList);
					// 			setMapOnAll(null);
					// 			markerList.pop();
					// 			setMapOnAll(null);

					// 		}
					// 		if (tempBlock[results[i].place_id].favorite == true) {
					// 			setMapOnAll(null);
					// 			createMarkerFavorite(results[i])

					// 		}


					// 	} else {
					// 		setMapOnAll(null);
					// 		createMarker(results[i]);

					// 	}



					// }
					// setMapOnAll(null);
					// setMapOnAll(map);


					map.setCenter(results[0].geometry.location);
				}
				console.log("Updating Restaurant List...");
				console.log(`${results.length}`);
				const newList = htmlToElement('<div class="content" id="content"></div>');
				let myPromise = new Promise(function (myResolve, myReject) {
					let myPromise2 = new Promise(function (myResolve, myReject) {
						let k = Object.assign({}, rhit.UserInfoManager.getSnap().BlockedRestaurant)
						console.log(`1123123x: ${rhit.UserInfoManager.getSnap()}`);


						setTimeout(function () {
							console.log(k);
							if (k !== undefined) {
								myResolve(k);
							} else {
								myReject("Error");

							}
						}, 2000);

					});
					myPromise2.then(
						function (value) {
							console.log(value);
							console.log("part1");
							for (let i = 0; i < results.length; i++) {
								const rt = results[i];
								if (!value.hasOwnProperty(`${rt.place_id}`)) {
									value[rt.place_id] = {
										'name': rt.name,
										'ignore': false,
										'favorite': false
									};
									console.log("1")

								}
								const newCard = createSection(rt);
								newList.appendChild(newCard);
								if (i >= (results.length - 1)) {
									console.log(`i:${i} results: ${results.length}, ${results[i].name}`)

								}
							}
							console.log(value);
							const oldList = document.querySelector("#colap");
							oldList.innerHTML = `<button type="button" class="collapsible">Open Collapsible</button>`
							var coll = document.getElementsByClassName("collapsible");
							var i;

							for (i = 0; i < coll.length; i++) {
								coll[i].addEventListener("click", function () {
									this.classList.toggle("active");
									var content = this.nextElementSibling;
									if (content.style.maxHeight) {
										content.style.maxHeight = null;
									} else {
										// content.scrollHeight
										content.style.maxHeight = 300 + "px";
									}
								});
							}
							oldList.appendChild(newList);
							console.log("cehckppoints")
							for (let i = 0; i < results.length; i++) {
								console.log(results[i].place_id)
								console.log(value);
								createMarker(results[i]);
								if (value.hasOwnProperty(results[i].place_id)) {
									if (value[results[i].place_id].ignore == true) {
										console.log(markerList);
										setMapOnAll(null);
										markerList.pop();
										setMapOnAll(null);

									}
									if (value[results[i].place_id].favorite == true) {
										setMapOnAll(null);
										createMarkerFavorite(results[i])

									}


								} else {
									setMapOnAll(null);
									createMarker(results[i]);

								}




								setMapOnAll(null);
								setMapOnAll(map);
								if (value[results[i].place_id].ignore) {
									document.getElementById(`${results[i].place_id}_ignore1`).style.backgroundColor = "red";
								}
								if (value[results[i].place_id].favorite) {
									document.getElementById(`${results[i].place_id}_favorite1`).style.backgroundColor = "red";
								}
								document.getElementById(`${results[i].place_id}_center`).onclick = (event) => {
									map.setCenter(results[i].geometry.location);
									map.setZoom(26);
								}
								document.getElementById(`${results[i].place_id}_ignore1`).onclick = (event) => {
									if (value[results[i].place_id].ignore == false) {
										console.log("clicked")
										document.getElementById(`${results[i].place_id}_ignore1`).style.backgroundColor = "red";
										value[results[i].place_id].ignore = true;

										setMapOnAll(null);
										markerList = removeItemOnce(markerList, results[i].place_id)
										setMapOnAll(map);
										console.log(markerList);
										rhit.UserInfoManager.update(locationLast, value);

									} else {
										document.getElementById(`${results[i].place_id}_ignore1`).style.backgroundColor = "white";
										console.log("clicked2")
										value[results[i].place_id].ignore = false;
										setMapOnAll(null);
										createMarker(results[i]);
										setMapOnAll(map);
										rhit.UserInfoManager.update(locationLast, value);

									}

								}
								document.getElementById(`${results[i].place_id}_favorite1`).onclick = (event) => {
									if (!value[results[i].place_id].favorite) {
										document.getElementById(`${results[i].place_id}_favorite1`).style.backgroundColor = "red";
										value[results[i].place_id].favorite = true;
										setMapOnAll(null);
										markerList = removeItemOnce(markerList, results[i].place_id)
										createMarkerFavorite(results[i]);
										setMapOnAll(map);
										rhit.UserInfoManager.update(locationLast, value);

									} else {
										document.getElementById(`${results[i].place_id}_favorite1`).style.backgroundColor = "white";
										value[results[i].place_id].favorite = false;
										setMapOnAll(null);
										markerList = removeItemOnce(markerList, results[i].place_id)
										if (!value[results[i].place_id].ignore) {
											createMarker(results[i]);
										}
										setMapOnAll(map);
										rhit.UserInfoManager.update(locationLast, value);
									}


								}
								document.getElementById("randomizer").onclick = (event) => {

									var key = Randomizer(results,value);

									document.getElementById("resultsText").innerHTML = `${results[key].name} <br> ${results[key].formatted_address}`;
									console.log("modals")
									var modal = document.getElementById("myModal");
									modal.style.display = "block";
									var span = document.getElementsByClassName("close")[0];
									span.onclick = function () {
										modal.style.display = "none";
									}
									window.onclick = function (event) {
										if (event.target == modal) {
											modal.style.display = "none";
										}
									}


								}
							}
							rhit.UserInfoManager.update(locationLast, value);

						},
						function (error) {})

					setTimeout(function () {

						myResolve("OK");

					}, 1000);

				});
				//tempBlock = tempBlock.concat(rhit.UserInfoManager.getSnap().BlockedRestaurant);

				myPromise.then(
					function (value) {

					},
					function (error) {
						console.log(error);
					}
				);


				// Put in the new quoteListContainer

			});
		}
	}
};

function createSection(restaurants) {
	return htmlToElement(
		`<div class="d-flex flex-row flex-cont">
		<div class="d-flex flex-column">
			<div class="p-2">
			${restaurants.name} <br> Address: ${restaurants.formatted_address}
			</div>
			<button type="button" id="${restaurants.place_id}_center" class="btn btn-outline-primary">Find</button>
		</div>
		<div class="d-flex flex-column ml-auto">

			<div class="p-2" style="border-radius: 20px; border: 2px solid red; margin: 5%" id="${restaurants.place_id}_ignore1">
			Ignore Restaurant



			</div>

			<div class="p-2" style="border-radius: 20px; border: 2px solid red; margin: 5%" id="${restaurants.place_id}_favorite1">
			Favorite Restaurant



			</div>

		</div>


	</div>
	`);
}

function createMarker(place) {
	if (!place.geometry || !place.geometry.location) return;
	const marker = new google.maps.Marker({
		map,
		position: place.geometry.location,
		name: `${place.place_id}`,
	});

	markerList.push(marker);
}

function createMarkerFavorite(place) {
	if (!place.geometry || !place.geometry.location) return;
	const marker = new google.maps.Marker({
		map,
		position: place.geometry.location,
		name: `${place.place_id}`,
		icon: 'http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png',
	});

	markerList.push(marker);
}

function setMapOnAll(maps) {
	for (let i = 0; i < markerList.length; i++) {
		markerList[i].setMap(maps);
	}
}

function removeItemOnce(arr, placeid) {
	var index;
	for (let i = 0; i < arr.length; i++) {
		if (arr[i].name == placeid) {
			arr.splice(i, 1);

		}
	}
	return arr;
}
rhit.Restaurants = class {
	constructor(name, placeid) {
		this.name = name;
		this.place_id = placeid;

	}
}

rhit.MapPageController = class {
	constructor() {

		console.log("map page loading...")
		rhit.UserInfoManager.getData2();
		rhit.UserInfoManager.getSnap();

		document.querySelector("#fastfood").addEventListener("click", (event) => {
			if (!locationLast) {
				initMap([39.2857, -87.1926], "fastfood");
			} else {
				initMap(locationLast, "fastfood");
			}
			document.querySelector("#fastfood").style.outline = "2px dashed blue;"
		});
		document.querySelector("#chicken").addEventListener("click", (event) => {
			if (!locationLast) {
				initMap([39.2857, -87.1926], "chicken");
			} else {
				initMap(locationLast, "chicken");
			}
		});
		document.querySelector("#asian").addEventListener("click", (event) => {
			if (!locationLast) {
				initMap([39.2857, -87.1926], "asian");
			} else {
				initMap(locationLast, "asian");
			}
		});
		document.querySelector("#mexican").addEventListener("click", (event) => {
			if (!locationLast) {
				initMap([39.2857, -87.1926], "mexican");
			} else {
				initMap(locationLast, "mexican");
			}
		});
		document.querySelector("#sandwhich").addEventListener("click", (event) => {
			if (!locationLast) {
				initMap([39.2857, -87.1926], "sandwhich");
			} else {
				initMap(locationLast, "sandwhich");
			}
		});
		document.querySelector("#japanese").addEventListener("click", (event) => {
			if (!locationLast) {
				initMap([39.2857, -87.1926], "japanese");
			} else {
				initMap(locationLast, "japanese");
			}
		});
		document.querySelector("#coffee").addEventListener("click", (event) => {
			if (!locationLast) {
				initMap([39.2857, -87.1926], "coffee");
			} else {
				initMap(locationLast, "coffee");
			}
		});
		document.querySelector("#soup").addEventListener("click", (event) => {
			if (!locationLast) {
				initMap([39.2857, -87.1926], "soup");
			} else {
				initMap(locationLast, "soup");
			}
		});
		document.querySelector("#seafood").addEventListener("click", (event) => {
			if (!locationLast) {
				initMap([39.2857, -87.1926], "seafood");
			} else {
				initMap(locationLast, "seafood");
			}
		});


		console.log("splide loading");
		new Splide(document.querySelector(".splide"), {
			type: 'loop',
			perPage: 5,
			perMove: 5,
		}).mount();

	}

}

function Randomizer(resultsData, Userdata) {
	console.log(`length  = ${Object.keys(Userdata).length}`);
	var check = false;
	console.log(Userdata);
	while (!check) {
		var randomNum = Math.floor(Math.random() * (resultsData.length));
		if (Userdata.hasOwnProperty(resultsData[randomNum].place_id)) {

			if (Userdata[resultsData[randomNum].place_id].ignore == false) {
				check = true;
				return randomNum;
			}
		}

	}
}
rhit.UserInfoManager = class {
	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_USERS);
		this.snapshot = null;
		this._unsubscribe = null;
	}
	getData() {
		this._ref.doc(this._uid).get().then((doc) => {
			if (doc.exists) {
				this.snapshot = doc.data();
				console.log("Retrieved Data")
			} else {
				// doc.data() will be undefined in this case
				console.log("No such document!");

			}
		}).catch((error) => {
			console.log("Error getting document:", error);
		});
	}
	getData2() {
		this._ref.doc(this._uid).get().then((doc) => {
			if (doc.exists) {
				console.log("Retrieved Data")
			} else {
				// doc.data() will be undefined in this case
				console.log("No such document!");
				this.add();
			}
		}).catch((error) => {
			console.log("Error getting document:", error);
		});
	}
	add() {
		// Add a new document with a generated id.
		this._ref.doc(this._uid).set({
				[rhit.FB_KEY_UID]: this._uid,
				[rhit.FB_KEY_LOCATION]: [],
				[rhit.FB_KEY_RestaurantBlock]: {},
				[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
			})
			.then(() => {
				this.getData();
				console.log("Document successfully written!");
			})
			.catch((error) => {
				console.error("Error adding document: ", error);
			});
	}
	update(location, restblocked) {
		this._ref.doc(this._uid).update({
				[rhit.FB_KEY_LOCATION]: location,
				[rhit.FB_KEY_RestaurantBlock]: restblocked,
				[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
			})
			.then(() => {
				console.log("doc update");
			})
			.catch(function (error) {
				// The document probably doesn't exist.
				console.error("error: ", error);
			});
	}
	getSnap() {
		this.getData();
		return this.snapshot;
	}

}


rhit.FbAuthManager = class {
	constructor() {
		this._user = null;
	}
	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
			changeListener();
		});
	}
	signIn() {
		console.log("TODO: sign in with roseFire");
		Rosefire.signIn("eacdca70-b055-44c6-919e-19bb9244e854", (err, rfUser) => {
			if (err) {
				console.log("Rosefire error!", err);
				return;
			}
			console.log("Rosefire success!", rfUser);
			firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
				var errorCode = error.code;
				var errorMessage = error.message;
				if (errorCode === 'auth/invalid-custom-token') {
					alert('The token you provided is not valid.');
				} else {
					console.error(error);
				}
			});

		});
	}
	signOut() {
		firebase.auth().signOut().catch((error) => {
			console.log("Sign out error");
		});
	}
	get isSignedIn() {
		return !!this._user;
	}
	get uid() {
		return this._user.uid;
	}
}

rhit.checkForRedirects = function () {
	if (document.querySelector("#loginPage") && rhit.FbAuthManager.isSignedIn) {
		window.location.href = "/map.html";
	}
	if (!document.querySelector("#loginPage") && !rhit.FbAuthManager.isSignedIn) {
		window.location.href = "/login.html"
	}
}
rhit.intializePage = function () {
	document.head.appendChild(script);
	const urlParams = new URLSearchParams(window.location.search);
	if (document.querySelector("#mapPage")) {
		console.log("You are on the Map Page");
		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			rhit.FbAuthManager.signOut();
		});
		const uid = urlParams.get("uid");
		if (!uid) {
			window.location.href = `/map.html?uid=${rhit.FbAuthManager.uid}`;
		}
		rhit.UserInfoManager = new rhit.UserInfoManager(uid);
		new rhit.MapPageController();
		// kekw = new rhit.MapPageController();
	}
}
rhit.startFirebaseUI = function () {
	// FirebaseUI config.
	var uiConfig = {
		signInSuccessUrl: `/map.html`,
		signInOptions: [
			// Leave the lines as is for the providers you want to offer your users.
			firebase.auth.GoogleAuthProvider.PROVIDER_ID,
			firebase.auth.EmailAuthProvider.PROVIDER_ID,
			firebase.auth.PhoneAuthProvider.PROVIDER_ID,
			firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
		],
	};
	var ui = new firebaseui.auth.AuthUI(firebase.auth());
	ui.start('#firebaseui-auth-container', uiConfig);
}
rhit.main = function () {
	console.log("Ready");
	rhit.FbAuthManager = new rhit.FbAuthManager();
	rhit.FbAuthManager.beginListening(() => {
		console.log("isSignedIn = ", rhit.FbAuthManager.isSignedIn);
		rhit.checkForRedirects();
		rhit.intializePage();
		rhit.startFirebaseUI();
	});

};

rhit.main();