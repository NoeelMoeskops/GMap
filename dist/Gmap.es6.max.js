class GMap {
    constructor(apiKey, target, mapOptions, callback) {
        this.apiKey = apiKey;
        this.target = target;
        this.mapOptions = mapOptions;
        this.callback = callback;
        this.markers = [];
        this.openMarkers = [];
        return this.initMap();
    }
    set zoom(level) {
        this.map.setZoom(level);
    }
    set center({ lat, lng }) {
        this.map.setCenter({ lat, lng });
    }
    set mapType(type) {
        this.map.setMapTypeId(type);
    }
    initMap() {
        this.map = new google.maps.Map(this.target, this.mapOptions);
        this.map.setOptions({
            styles: [
                {
                    featureType: 'poi.business',
                    elementType: "labels",
                    stylers: [{ visibility: 'off' }]
                },
                {
                    featureType: 'transit',
                    elementType: 'labels.icon',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        });
        this.legenda();
        this.clustify();
        this.callback();
        return this.map;
    }
    addTag(url, callback) {
        let tag = document.createElement("script");
        tag.type = "text/javascript";
        tag.src = url;
        let firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        if (tag.readyState) {
            tag.onreadystatechange = () => {
                if (tag.readyState === "loaded" || tag.readyState === "complete") {
                    tag.onreadystatechange = null;
                    callback();
                }
            };
        }
        else {
            tag.onload = () => {
                callback();
            };
        }
        return tag;
    }
    getCor(adress) {
        const geoURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + adress + "&key=" + this.apiKey;
        let xmlHttp = new XMLHttpRequest();
        let response;
        xmlHttp.open("GET", geoURL, false);
        xmlHttp.send(null);
        response = JSON.parse(xmlHttp.responseText);
        return response.results[0].geometry.location;
    }
    marker(slug) {
        for (let i = 0; i < this.markers.length; i++) {
            if (this.markers[i].slug === slug)
                return this.markers[i];
        }
    }
    makeMarker({ lat, lng }, title, content, categorie, link) {
        const headTag = "h4";
        const contentTag = "p";
        const readMore = "<a href=" + link + ">Lees meer.</a>";
        let marker;
        let infoWindow;
        let text = content ? "<a href='" + link + "'><" + headTag + ">" + title + "</" + headTag + "> </a>" + "<" + contentTag + ">" + content + "\n" + readMore + "</" + contentTag + ">" : "<a href='" + link + "'><" + headTag + ">" + title + "</" + headTag + "> </a>";
        let legenda = this.marker(categorie);
        const iconsize = 26;
        let image = {
            url: legenda.icon,
            scaledSize: new google.maps.Size(iconsize, iconsize),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(0, 0)
        };
        marker = new google.maps.Marker({
            position: { lat: lat, lng: lng },
            map: this.map,
            title: title,
            icon: image
        });
        legenda.items.push(marker);
        this.cluster.addMarker(marker);
        if (legenda.DOM.style.display === "none") {
            legenda.DOM.style.display = "block";
        }
        infoWindow = new google.maps.InfoWindow({
            content: text
        });
        marker.addListener("click", () => {
            for (let i = 0; i < this.openMarkers.length; i++) {
                this.openMarkers[i].close();
                this.openMarkers.splice(i, 1);
            }
            infoWindow.open(this.map, marker);
            this.openMarkers.push(infoWindow);
        });
        return marker;
    }
    toggleCat(categorie) {
        for (let i = 0; i < this.marker(categorie).items.length; i++) {
            let marker = this.marker(categorie).items[i];
            if (!marker.getVisible()) {
                marker.setVisible(true);
            }
            else {
                marker.setVisible(false);
            }
        }
    }
    getAllMarkers() {
        let cluster = [];
        for (let mLength = 0; mLength < this.markers.length; mLength++) {
            for (let iLength = 0; iLength < this.markers[mLength].items.length; iLength++) {
                cluster.push(this.markers[mLength].items[iLength]);
            }
        }
        return cluster;
    }
    clustify() {
        let style = {
            url: "https://github.com/Noedel-Man/GMap/img/cluster.png",
            height: 26,
            width: 26,
            anchor: [0, 0],
            textColor: '#ffffff',
            textSize: 12
        };
        this.cluster = new MarkerClusterer(this.map, [], {
            minimumClusterSize: 4,
            maxZoom: 16,
            gridSize: 30,
            averageCenter: false,
            styles: [style, style, style],
        });
    }
    legenda() {
        this.legendaDOM = document.createElement("div");
        let width = "24px";
        this.legendaDOM.style.position = "absolute";
        this.legendaDOM.style.zIndex = "1";
        this.legendaDOM.style.top = "50px";
        this.legendaDOM.style.left = "14px";
        this.legendaDOM.style.width = width;
        this.target.insertBefore(this.legendaDOM, this.target.firstChild);
    }
    addLegendaItem(name, slug, iconUrl) {
        const width = "24px";
        let item = document.createElement("div");
        let img = document.createElement("img");
        let text = document.createElement("span");
        let tag = "span";
        let visable = true;
        let marker = {
            "slug": slug,
            "name": name,
            "icon": iconUrl,
            "DOM": item,
            "items": [],
        };
        this.markers.push(marker);
        item.style.marginTop = "10px";
        item.style.cursor = "pointer";
        item.style.display = "none";
        item.style.position = "relative";
        img.style.width = width;
        img.src = marker.icon;
        item.style.filter = "grayscale(10%)";
        item.style.webkitFilter = "grayscale(10%)";
        img.style.opacity = "0.8";
        text.style.position = "absolute";
        text.style.transform = "translateY(-50%)";
        text.style.top = "50%";
        text.style.left = "120%";
        text.style.opacity = "0";
        text.style.fontStyle = "italic";
        text.style.fontSize = "0.9em";
        text.innerHTML = marker.name;
        item.appendChild(img);
        item.appendChild(text);
        this.legendaDOM.appendChild(item);
        item.addEventListener("click", () => {
            this.toggleCat(slug);
            let marker = this.marker(slug).items[0];
            if (marker.getVisible()) {
                visable = true;
                item.style.filter = "grayscale(10%)";
                item.style.webkitFilter = "grayscale(10%)";
                img.style.opacity = "0.8";
            }
            else {
                visable = false;
                item.style.filter = "grayscale(100%)";
                item.style.webkitFilter = "grayscale(100%)";
                img.style.opacity = "0.6";
            }
        }, false);
        item.addEventListener("mouseenter", () => {
            item.style.filter = "grayscale(0%)";
            item.style.webkitFilter = "grayscale(0%)";
            img.style.opacity = "1";
            text.style.opacity = "1";
        }, false);
        item.addEventListener("mouseleave", () => {
            if (visable) {
                item.style.filter = "grayscale(10%)";
                item.style.webkitFilter = "grayscale(10%)";
                img.style.opacity = "0.8";
            }
            else {
                item.style.filter = "grayscale(100%)";
                item.style.webkitFilter = "grayscale(100%)";
                img.style.opacity = "0.6";
            }
            text.style.opacity = "0";
        }, false);
    }
}
