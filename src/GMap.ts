// requires js-marker-clusterer
/**Use for google map api*/
class GMap {

  public markers = [];
  private openMarkers = [];
  /**map object*/
  public map;
  private legendaDOM;
  private cluster;
  /**Set zoom*/
  set zoom(level: number) {
    this.map.setZoom(level);
  }
  /**Sets center of map*/
  set center({lat, lng}: { lat: number, lng: number }) {
    this.map.setCenter({ lat, lng });
  }
  /**Sets mapTypeId*/
  set mapType(type: string) {
    this.map.setMapTypeId(type);
  }

  /**Build google map, Returns map object*/
  constructor(private apiKey: string, private target: any, private mapOptions: any, private callback: any) {
    // this.addTag("https://maps.googleapis.com/maps/api/js?key=" + this.apiKey, () => {
      return this.initMap();
    // });
  }

  /**Build map*/
  private initMap(): any {
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
  /**Add tag BEFORE first scripttag on html page, Returns DOM object*/
  private addTag(url: any, callback: any): any {
    let tag = document.createElement("script");
    tag.type = "text/javascript";
    tag.src = url;
    let firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    if (tag.readyState) {  // IE
      tag.onreadystatechange = () => {
        if (tag.readyState === "loaded" || tag.readyState === "complete") {
          tag.onreadystatechange = null;
          callback();
        }
      };
    } else {  // Others
      tag.onload = () => {
        callback();
      };
    }
    return tag;
  }
  /**Returns coordinates of a place - Return {lat: float, lng: float}*/
  public getCor(adress: string): any {
    const geoURL: string = "https://maps.googleapis.com/maps/api/geocode/json?address=" + adress + "&key=" + this.apiKey;
    let xmlHttp = new XMLHttpRequest();
    let response;
    xmlHttp.open("GET", geoURL, false); // false for synchronous request
    xmlHttp.send(null);
    response = JSON.parse(xmlHttp.responseText);
    return response.results[0].geometry.location;
  }

  /**Select marker of categorie, use slug*/
  public marker(slug: string): any {
    for (let i: number = 0; i < this.markers.length; i++) {
      if (this.markers[i].slug === slug) return this.markers[i];
    }
  }
  /**Create a marker on map, Returns marker object*/
  public makeMarker({lat, lng}: { lat: number, lng: number }, title: string, content: string, categorie: string, link: string): any {
    const headTag: string = "h4";
    const contentTag: string = "p";
    const readMore: string = "<a href=" + link + ">Lees meer.</a>";
    let marker;
    let infoWindow;
    let text = content ? "<a href='" + link + "'><" + headTag + ">" + title + "</" + headTag + "> </a>" + "<" + contentTag + ">" + content + "\n" + readMore + "</" + contentTag + ">" : "<a href='" + link + "'><" + headTag + ">" + title + "</" + headTag + "> </a>";
    let legenda = this.marker(categorie);
    const iconsize: number = 26;
    let image = {
      url: legenda.icon,
      scaledSize: new google.maps.Size(iconsize, iconsize),
      origin: new google.maps.Point(0, 0), // origin
      anchor: new google.maps.Point(0, 0) // anchor
    };
    // make marker
    marker = new google.maps.Marker({
      position: { lat: lat, lng: lng },
      map: this.map,
      title: title,
      icon: image
    });


    // add categorie
    legenda.items.push(marker);
    // add marker to cluster
    this.cluster.addMarker(marker);
    // make legenda visable
    if (legenda.DOM.style.display === "none") {
      legenda.DOM.style.display = "block";
    }


    // make infoWindow
    infoWindow = new google.maps.InfoWindow({
      content: text
    });
    marker.addListener("click", () => {
      for (let i: number = 0; i < this.openMarkers.length; i++) {
        this.openMarkers[i].close();
        this.openMarkers.splice(i, 1);
      }
      infoWindow.open(this.map, marker);
      this.openMarkers.push(infoWindow);
    });
    return marker;
  }
  // Delete marker*/
  // does not work anymore :(. Not fixed because not needed
  // public deleteMarker(title: string): void {
  //     for (let i: number = 0; i < this.markers.length; i++) {
  //         if (this.markers[i].title === title) {
  //             this.markers[i].setMap(null);
  //             return;
  //         }
  //     }
  // }

  /**Hide or display a categorie*/
  public toggleCat(categorie: string): void {
    for (let i: number = 0; i < this.marker(categorie).items.length; i++) {
      let marker = this.marker(categorie).items[i];
      if (!marker.getVisible()) {
        marker.setVisible(true);
      } else {
        marker.setVisible(false);
      }
    }
  }
  /** get all the markers in a single flat array. */
  public getAllMarkers(): any[] {
    let cluster: any = [];
    for (let mLength: number = 0; mLength < this.markers.length; mLength++) {
      for (let iLength: number = 0; iLength < this.markers[mLength].items.length; iLength++) {
        cluster.push(this.markers[mLength].items[iLength]);
      }
    }
    return cluster;
  }

  // add clusters, only called onces from initMap.
  private clustify(): void {
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

  /**Handels the legenda*/
  private legenda(): void {
    this.legendaDOM = document.createElement("div");
    let width: string = "24px";
    // style
    this.legendaDOM.style.position = "absolute";
    this.legendaDOM.style.zIndex = "1";
    this.legendaDOM.style.top = "50px";
    this.legendaDOM.style.left = "14px";
    this.legendaDOM.style.width = width;

    // place the legenda
    this.target.insertBefore(this.legendaDOM, this.target.firstChild);
  }
  /**Make new legenda item*/
  public addLegendaItem(name: string, slug: string, iconUrl: string) {
    const width: string = "24px";
    let item = document.createElement("div");
    let img = document.createElement("img");
    let text = document.createElement("span");
    let tag: string = "span";
    let visable: boolean = true;
    let marker = {
      "slug": slug,
      "name": name,
      "icon": iconUrl,
      "DOM": item,
      "items": [],
    };
    this.markers.push(marker);
    // style
    item.style.marginTop = "10px";
    item.style.cursor = "pointer";
    item.style.display = "none";
    // item.style.overflow = "hidden";
    item.style.position = "relative";
    // img
    img.style.width = width;
    img.src = marker.icon;

    item.style.filter = "grayscale(10%)";
    item.style.webkitFilter = "grayscale(10%)";
    img.style.opacity = "0.8";
    // text
    text.style.position = "absolute";
    text.style.transform = "translateY(-50%)";
    text.style.top = "50%";
    text.style.left = "120%";
    text.style.opacity = "0";
    text.style.fontStyle = "italic";
    text.style.fontSize = "0.9em";

    text.innerHTML = marker.name;
    // place element
    item.appendChild(img);
    item.appendChild(text);
    this.legendaDOM.appendChild(item);
    // liseteners
    // niet zo DRY maar ik had geen zin meer
    item.addEventListener("click", () => {
      this.toggleCat(slug);
      let marker = this.marker(slug).items[0];
      if (marker.getVisible()) {
        visable = true;
        item.style.filter = "grayscale(10%)";
        item.style.webkitFilter = "grayscale(10%)";
        img.style.opacity = "0.8";
      } else {
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
      } else {
        item.style.filter = "grayscale(100%)";
        item.style.webkitFilter = "grayscale(100%)";
        img.style.opacity = "0.6";
      }
      text.style.opacity = "0";
    }, false);
  }
}
