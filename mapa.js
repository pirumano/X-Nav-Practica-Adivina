var dificultad = "";
var dificultadAntigua = "";
var tipojuego = "";
var tipojuegoAntiguo = "";
var tiempo;
var anteriorSitio = "";
var numberPhoto = 0;
var numberPhotoAntiguo = 0;
var fotosMostradas;
var intervalo;
var resultado;
var coorActual;
var puntuacionTotal = 0;
var puntuacionTotalAntigua = 0;
var first = 1;

var map = L.map('map').locate({setView: true, maxZoom: 2});

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function getTime(){
	var date = new Date()
	var hour = date.getHours()
	var minute = date.getMinutes()
	var second = date.getSeconds()
	if (hour < 10) {hour = "0" + hour}
	if (minute < 10) {minute = "0" + minute}
	if (second < 10) {second = "0" + second}
	var finalHour = hour + ":" + minute + ":" + second;

	return finalHour;
}

function reset(){
	clearInterval(intervalo);
	numberPhoto = 0;
	fotosMostradas = 0;
	puntuacionTotal = 0;
	tipojuego = "";
	dificultad = "";
	$("#images").empty();
	$("#puntos").html(parseInt("0"));
	$('#Dificultad').prop('selectedIndex',0);
	$('#tipoJuego').prop('selectedIndex',0);
}
	
function guardarJuego(){
	clearInterval(intervalo);
	var value;
	var stateObj = { 
		puntos: puntuacionTotal,
		number: numberPhoto,
		tipo: tipojuego,
		dificultad: dificultad,
	};
	history.pushState(stateObj, "juegoGuardado", "?juego="+tipojuego);
}

function remplaceJuego(){
	clearInterval(intervalo);
	var value;
	var stateObj = { 
		puntos: puntuacionTotalAntigua,
		number: numberPhotoAntiguo,
		tipo: tipojuegoAntiguo,
		dificultad: dificultadAntigua,
	};
	history.replaceState(stateObj, "juegoGuardado", "?juego="+tipojuegoAntiguo);
	value = parseInt(-1);
	$("#lista-anteriores").append("<li value=\""+value+"\"><a><span>"+tipojuegoAntiguo+",   Hora:"+getTime()+"</a></span></li>");
}

function remplace2Juego(){
	clearInterval(intervalo);
	var value;
	var stateObj = { 
		puntos: puntuacionTotal,
		number: numberPhoto,
		tipo: tipojuego,
		dificultad: dificultad,
	};
	history.replaceState(stateObj, "juegoGuardado", "?juego="+tipojuego);
	value = parseInt(-1);
}

window.onpopstate = function(event){
	map.off('click');
	clearInterval(intervalo);
	puntuacionTotal = event.state.puntos;
	$("#puntos").empty;
	$("#puntos").html(parseInt(puntuacionTotal));
	numberPhoto = event.state.number;
	tipojuego = event.state.tipo;
	dificultad = event.state.dificultad;
	if(dificultad == "Facil")
		tiempo = parseInt(5000);
	if(dificultad == "Medio")
		tiempo = parseInt(3000);
	if(dificultad == "Dificil")
		tiempo = parseInt(1000);
	$("#tipoJuego option[value="+ tipojuego +"]").attr("selected",true);
	$("#Dificultad option[value="+ dificultad +"]").attr("selected",true);
};

function addHistory(){
	var len = $("#lista-anteriores li").length;
	$("#lista-anteriores li").each(function(){
		if($(this).attr("value") != 0){
			var value = $(this).attr("value");
			$(this).attr("value", value-1);
			value = value - 1;
		}
	});
}

function calcularPuntuacion(e){
	var ll = e.latlng;
	var posic = ll.toString();
	array = posic.split(",");
	array2 = array[0].split("(");
	latitud = array2[1];
	array3 = array[1].split(")");
	longitud = array3[0];
	var coorActual2 = coorActual.toString();
	array4 = coorActual2.split(",");
	latBuena = array4[0];
	lonBuena = array4[1];
	var distancia = distance(latitud, longitud, latBuena, lonBuena, "K");
	alert("Te has quedado a " + distancia + " kms.");
	puntuacion = distancia * fotosMostradas;
	alert("Tu puntuacion es de: " + puntuacion);
	puntuacionTotal = parseFloat(puntuacionTotal) + parseFloat(puntuacion);
	$("#puntos").empty();
	$("#puntos").html(parseInt(puntuacionTotal));
}

function changePhoto(sitio){
	$.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?tags="
			+sitio+"&tagmode=any&format=json&jsoncallback=?", function(data2){
					var i = 0;
					intervalo = setInterval(function(){
						$("#images").empty();
						$("<img/>").attr("src", data2.items[i].media.m).attr("alt", 
										data2.items[i].title).attr("title", 
										data2.items[i].title).appendTo("#images");
						i++;
						fotosMostradas = i;
						if(i == 5)
							clearInterval(intervalo);
					}, tiempo);
	});
}

function takeJson (){
	var sitio;
	$.getJSON('juegos/'+tipojuego+'.json', function(data){
			}).done(function(data){
				sitio = data.juego[numberPhoto].properties.name;
				coorActual = data.juego[numberPhoto].geometry.coordinates;
				resultado = sitio;
				changePhoto(sitio);
				map.on('click', function(e) {
					numberPhoto++;
					if(numberPhoto > 5){
						alert("FIN DEL JUEGO");
						return;
					}
					clearInterval(intervalo);
					puntuacion = calcularPuntuacion(e);
					alert("EL RESULTADO ERA: " + resultado);
					sitio = data.juego[numberPhoto].properties.name;
					coorActual = data.juego[numberPhoto].geometry.coordinates;
					resultado = sitio;
					changePhoto(sitio);
				});
			});
}

function distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1/180;
    var radlat2 = Math.PI * lat2/180;
    var radlon1 = Math.PI * lon1/180;
    var radlon2 = Math.PI * lon2/180;
    var theta = lon1-lon2;
    var radtheta = Math.PI * theta/180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) 
    					+ Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

    dist = Math.acos(dist);
    dist = dist * 180/Math.PI;
    dist = dist * 60 * 1.1515;

    if (unit == "K"){
    	dist = dist * 1.609344;
    }
    if (unit == "N"){ 
    	dist = dist * 0.8684;
    }

    return dist;
}

function goHistory(pos){
	if(pos == 0){
		alert("YA ESTAS EN ESTE JUEGO!!");
	}else{
		history.go(pos);
	}
}

function changePos(pos){
	pos = parseInt(pos);
	$("#lista-anteriores li").each(function(){
		var value = $(this).attr("value");
		value = value - pos;
		$(this).attr("value", value);
	});
}

$("#anteriores").on( "click", "a" ,function() {
	first = 1;
	$("#Aceptar").prop('disabled', false);
	remplace2Juego();
	$("#images").empty();
    var nombre = $(this).children("span").text()
    $("#titulo").html("Juego de: "+ nombre);
    var pos = $(this).parent().attr("value");
    goHistory(pos);
    changePos(pos);
});

$("#nuevo").click(function(){
	map.off('click');
	clearInterval(intervalo);
	tipojuegoAntiguo = tipojuego;
	dificultadAntigua = dificultad;
	puntuacionTotalAntigua = puntuacionTotal;
	numberPhotoAntiguo = numberPhoto;
	reset();
	$("#Aceptar").prop('disabled', false);
});

$("#abortar").click(function(){
	map.off('click');
	clearInterval(intervalo);
});

$("#comenzar").click(function(){
	takeJson();
});

$("#Aceptar").click(function(){
	if((tipojuego != "") && (dificultad != "")){
		$("#titulo").html("Juego de: "+ tipojuego);
		if(!first){
			addHistory();
			remplaceJuego();
		}
		$("#comenzar").prop('disabled', false);
		$("#Aceptar").prop('disabled', true);
		first = 0;
		guardarJuego();
	}else{
		alert("Elija TIPO DE JUEGO y DIFICULTAD");
	}
});

$("#tipoJuego").change(function(){
	tipojuego = $(this).val();
	$("#Dificultad").prop('disabled', false);
	numberPhoto = 0;
});

$("#Dificultad").change(function(){
	dificultad = $(this).val();
	if(dificultad == "Facil")
		tiempo = parseInt(5000);
	if(dificultad == "Medio")
		tiempo = parseInt(3000);
	if(dificultad == "Dificil")
		tiempo = parseInt(1000);
});