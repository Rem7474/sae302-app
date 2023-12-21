//AUTHOR : Rémy CUVELIER
//DATE : 20/12/2023
//VERSION : 1.0
//DESCRIPTION : Fichier javascript pour l'application mobile
//PLUGINS : community-cordova-plugin-nfc, cordova-plugin-codescanner, cordova-plugin-camera
//A RAJOUTER : plugin diagnostic pour vérifier si le NFC et la caméra sont activés

//VARIABLE TEST
//METTRE A FALSE POUR TESTER AVEC LES PLUGINS
let test = false;
if (test){
  console.log("test");
  eventListeners();
}
document.addEventListener('deviceready', onDeviceReady, false);
console.log("Chargement de l'application");

//FONCTION : onDeviceReady
function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    /*--------------------------------------------------------------------------*/
    //EVENTS LISTENERS
    eventListeners();
}
//EVENTS LISTENERS
function eventListeners(){
    //Bouton pour lancer le scan
    document.getElementById("scan").addEventListener("click", AjoutPanier, false);
  
    //Event pour vérifier si l'appareil est hors ligne
    document.addEventListener("offline", OffLineError, false);
  }
function OffLineError(){
    alert("Vous êtes hors ligne");
}
//FONCTION : AjoutPanier
function AjoutPanier(){
    console.log("Ajout au panier");
    //ETAPE 1 : lancer le scan du code barre    
    //ETAPE 4 : ajouter le produit au panier
    //ETAPE 5 : afficher le panier
    //ETAPE 6 : afficher le prix total
    //ETAPE 7 : afficher le bouton pour valider le panier
    var article = {};
    cordova.plugins.barcodeScanner.scan(
        function (result) {
        console.log(result.text);
        //ETAPE 2 : récupérer le code barre
        //appelle de la fonction pour récupérer les infos du produit
        //ETAPE 3 : récupérer les infos du produit
        API_Get_Product(result.text)
            .then(response => {
                if (!response.ok) {
                Display_Error("Erreur de la requête 1" ,"ScanUpdateProduct",response.status);
                }
                return response.json();
            })
            .then(data => {
                if (data.message == "Product found") {
                    //affiche les infos dans le formulaire
                    let id=data.produit_barcode;
                    article[id] = data;
                    //avant l'envoie du formulaire vérifier ce qui a été changé par rapport a data
                    //récupérer stock
                    API_Get_Stock(data.produit_barcode)
                    .then (response => {
                        document.getElementById("Loading").classList.add("hidden");
                        if (!response.ok) {
                        Display_Error("Erreur de la requête 2" ,"ScanUpdateProduct",response.status);
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.message == "Stock found") {
                            //affiche les infos dans le formulaire
                            let id=data.stock_barcode;
                            article[id]["stock"] = data.stock_quantite;
                            console.log(JSON.stringify(article[id])); //->"{"produit_barcode":"52202023","produit_nom":"Cuvelier","produit_prix_achat":"100.00","produit_prix_vente":"150.00","message":"Product found","quantite":14}"
                            AddtoPanier(panier);
                        }
                        else{
                            Display_Error("Stock not found" ,"ScanUpdateProduct",data);
                        }
                    })
                    .catch(error => {
                        Display_Error("Erreur inconnue 1" ,"ScanUpdateProduct",error);
                    });
              }
              else{
                Display_Error("Produit introuvable" ,"ScanUpdateProduct",data);
              }
            })
            .catch(error => {
                Display_Error("Erreur inconnue 2" ,"ScanUpdateProduct",error);
            });
        },
        function (error) {
            alert("Scanning failed: " + error);
        },
        {
            preferFrontCamera : false, // iOS and Android
            showFlipCameraButton : false, // iOS and Android
            showTorchButton : true, // iOS and Android
            torchOn: true, // Android, launch with the torch switched on (if available)
            saveHistory: false, // Android, save scan history (default false)
            prompt : "Placer le code barre a lire dans la zone", // Android
            resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            formats : "all", // default: all but PDF_417 and RSS_EXPANDED
            orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
            disableAnimations : true, // iOS
            disableSuccessBeep: true // iOS and Android
        }
      );
}
function Display_Error(message, fonction, details){
    alert(message);
    console.log(JSON.stringify(details));
    console.log("Erreur de :"+fonction+" : "+message);
}
function AddtoPanier(localarticle){
    //article : description du produit avec le stock max disponible
    //vérifie le panier actuel et ajoute le produit ou augmente la quantité
    //récupération du panier (s'il existe) dans le localstorage
    let localpanier = JSON.parse(localStorage.getItem("panier"));
    if (localpanier == null){
        localpanier = {};
    }
    //vérifie si le produit est déjà dans le panier
    if (localpanier[localarticle["produit_barcode"]] == null){
        //ajoute le produit au panier s'il est en stock
        if (localarticle["stock"] > 0){
            localpanier[localarticle["produit_barcode"]] = localarticle;
            localpanier[localarticle["produit_barcode"]]["quantite"] = 1;
        }
        else{
            alert("Produit en rupture de stock");
        }
    }
    else{
        //augmente la quantité s'il est en stock
        if (localarticle["stock"] > localpanier[localarticle["produit_barcode"]]["quantite"]){
            localpanier[localarticle["produit_barcode"]]["quantite"] += 1;
        }
        else{
            alert("Produit en rupture de stock");
        }
    }
    //enregistre le panier dans le localstorage
    localStorage.setItem("panier", JSON.stringify(localpanier));
    //affiche le panier
    AffichePanier();
}
function AffichePanier(){
    console.log("Ajout au panier");
    console.log(JSON.stringify(localpanier));
    let panierHTML = "";
    let total = 0;
    let table=document.createElement("table");
    table.classList.add("mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp");
    /*
    <thead>
    <tr>
      <th class="mdl-data-table__cell--non-numeric">Material</th>
      <th>Quantity</th>
      <th>Unit price</th>
    </tr>
  </thead>*/
    let thead=document.createElement("thead");
    let tr=document.createElement("tr");
    let th=document.createElement("th");
    th.classList.add("mdl-data-table__cell--non-numeric");
    th.innerHTML="Nom";
    tr.appendChild(th);
    th=document.createElement("th");
    th.innerHTML="Quantité";
    tr.appendChild(th);
    th=document.createElement("th");
    th.innerHTML="Prix Total";
    tr.appendChild(th);
    thead.appendChild(tr);
    table.appendChild(thead);
    let tbody=document.createElement("tbody");
    for (let id in localpanier){
        let tr=document.createElement("tr");
        let td=document.createElement("td");
        td.classList.add("mdl-data-table__cell--non-numeric");
        td.innerHTML=localpanier[id]["produit_nom"];
        tr.appendChild(td);
        td=document.createElement("td");
        td.innerHTML=localpanier[id]["quantite"];
        tr.appendChild(td);
        td=document.createElement("td");
        td.innerHTML=localpanier[id]["quantite"]*localpanier[id]["produit_prix_vente"];
        tr.appendChild(td);
        tbody.appendChild(tr);
        total += localpanier[id]["quantite"]*localpanier[id]["produit_prix_vente"];
    }
    //ajout des event listeners sur les cases à cocher pour appeler la fonction de calcul du total
    table.appendChild(tbody);
    document.getElementById("panier").innerHTML = "";
    document.getElementById("panier").appendChild(table);
    //
    /*
    document.getElementById("panier").innerHTML = panierHTML;
    document.getElementById("total").innerHTML = "Total : "+total;
    document.getElementById("valider").classList.remove("hidden");
    */
    //document.getElementById("valider").addEventListener("click", ValiderPanier, false);
}