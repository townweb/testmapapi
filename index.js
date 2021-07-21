/***
 * GoogleMaps
 */

let map;
const $mapGoogle = document.getElementById("mapGoogleData");
let contentHTML = "";
const locationCoords = { lat: 55.758408, lng: 37.621459 };
let searchRad = 500;

function initMap() {
    map = new google.maps.Map(document.getElementById("mapGoogle"), {
        center: locationCoords,
        zoom: 15,
    });
    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
        location: locationCoords,
        radius: 500,
      //  name: "Макдональдс",  // this won't work, try removing name property and the place will show in the result
        type: ['subway_station']
    }, callback);

    function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                contentHTML += "Name: " + results[i].name + "<br>";
            }
            $mapGoogle.innerHTML += "Точка поиска  | " + locationCoords.lat + ":" + locationCoords.lng +"<br>";
            $mapGoogle.innerHTML += "Радиус поиска  | " + searchRad +"<br>"+"<br>";
         /*   let successCnt = 0;
            let bounds = new google.maps.LatLngBounds();*/
            results.forEach(function (element) {

                $mapGoogle.innerHTML += element.name + " | " + element.vicinity+ "|"+"<br>";
           /*     service.getDetails({
                    placeId:  element.place_id
                }, function (place, status) {
                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                        successCnt += 1;
                        var marker = new google.maps.Marker({
                            map: map,
                            position: place.geometry.location,
                            title: place.name
                        });
                        for (var i = 0; i < place.address_components.length; i++) {
                            for (var j = 0; j < place.address_components[i].types.length; j++) {
                                if (place.address_components[i].types[j] == "street_number") {
                                    document.getElementById('info').innerHTML += "street_number:" + place.address_components[i].long_name + "<br>";
                                }
                            }
                        }
                        console.log(place);
                        bounds.extend(marker.getPosition());
                        map.fitBounds(bounds);
                    } else {

                    }
                });
*/

            });

            console.log(results);
        }else{
            console.error(status);
        }//end of if()
    }//end of callback()
}

/***
 * YandexКарты
 */
searchRad = 25000;
const yaCords = [59.927867, 30.358634];
const boundedBy = [
    [yaCords[0]-(searchRad/2000000) , yaCords[1]-(searchRad/2000000) ],
    [yaCords[0]+(searchRad/2000000) , yaCords[1]+(searchRad/2000000) ]
];
console.log(boundedBy);
const $yandexMapData = document.getElementById("mapYandexData");
console.log(searchRad/2000000);

ymaps.ready(init);
function init(){
    // Создание карты.
    var myMap = new ymaps.Map("mapYandex", {
        center: yaCords,
        zoom: 15
    });
    ymaps.geocode(myMap.getCenter(), {
        /**
         * Опции запроса
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/geocode.xml
         */
        // Ищем только станции метро.
        kind: 'metro',
        // Запрашиваем не более 20 результатов.
        results: 1000000,
        boundedBy: boundedBy,
        strictBounds: true
    }).then(function (res) {
        $yandexMapData.innerHTML += "Точка поиска  | " + yaCords[0] + ":" + yaCords[1] +"<br>";
        $yandexMapData.innerHTML += "Радиус поиска  | " + searchRad +"<br>"+"<br>";
        res.geoObjects.each(function(obj) {
            ymaps.geocode(obj.geometry.getCoordinates(), { kind: 'street' , results: 5}).then(function (resStreet) {
              //  var resStreet = resStreet.geoObjects.get(0);
                console.log(resStreet.geoObjects.get(2));
                const street = resStreet.geoObjects.get(3);
                console.log(street.properties.get('text'));
                $yandexMapData.innerHTML += "Метро  | " + obj.properties.get('text') + "<br>";
                resStreet.geoObjects.each(function (street) {
                    $yandexMapData.innerHTML += "" + street.properties.get('text') + "<br>";

                });

                $yandexMapData.innerHTML += "Метро  | " + obj.properties.get('text') + " (Ближайшая улица  | " + resStreet.properties.get('text')+")<br>";
            });
        });
        // Задаем изображение для иконок меток.
        res.geoObjects.options.set('preset', 'islands#redCircleIcon');
        res.geoObjects.events
        // При наведении на метку показываем хинт с названием станции метро.
            .add('mouseenter', function (event) {
                var geoObject = event.get('target');
                myMap.hint.open(geoObject.geometry.getCoordinates(), geoObject.getPremise());
            })
            // Скрываем хинт при выходе курсора за пределы метки.
            .add('mouseleave', function (event) {
                myMap.hint.close(true);
            });
        // Добавляем коллекцию найденных геообъектов на карту.
        myMap.geoObjects.add(res.geoObjects);
        // Масштабируем карту на область видимости коллекции.
        myMap.setBounds(res.geoObjects.getBounds());
    });
}
