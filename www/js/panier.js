//AUTHOR : Rémy CUVELIER
//DATE : 20/12/2023
//VERSION : 1.0
//DESCRIPTION : Fichier javascript pour l'application mobile
//PLUGINS : community-cordova-plugin-nfc, cordova-plugin-codescanner, cordova-plugin-camera, cordova-plugin-dialogs
//A RAJOUTER : plugin diagnostic pour vérifier si le NFC et la caméra sont activés

//VARIABLE TEST
//METTRE A FALSE POUR TESTER AVEC LES PLUGINS
const TEST = true;
if (TEST){
  console.log("test");
  testpanier();
  eventListeners();
}
document.addEventListener('deviceready', onDeviceReady, false);
console.log("Chargement de l'application");

//FONCTION : onDeviceReady
function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    /*--------------------------------------------------------------------------*/
    //EVENTS LISTENERS
    if (!TEST){
      eventListeners();
      AffichePanier();
    }
}
//EVENTS LISTENERS
function eventListeners(){
    //Bouton pour lancer le scan
    document.getElementById("scan").addEventListener("click", AjoutPanier, false);
  
    //Event pour vérifier si l'appareil est hors ligne
    document.addEventListener("offline", OffLineError, false);

    //bouton de validation et suppression du panier
    document.getElementById("valider").addEventListener("click", CheckboxPanier, false);    
    document.getElementById("delete").addEventListener("click", function(){ArticleAction("delete")}, false);
    document.getElementById("moins").addEventListener("click", function(){ArticleAction("moins")}, false);
    document.getElementById("plus").addEventListener("click", function(){ArticleAction("plus")}, false);
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
        document.getElementById("Loading").classList.remove("hidden");
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
                            AddtoPanier(JSON.stringify(article[id]));
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
                document.getElementById("Loading").classList.add("hidden");
                Display_Error("Produit introuvable" ,"ScanUpdateProduct",data);
              }
            })
            .catch(error => {
                document.getElementById("Loading").classList.add("hidden");
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
    navigator.notification.alert(message, null, "Erreur de : "+fonction, "OK");
    console.log(JSON.stringify(details));
    console.log("Erreur de :"+fonction+" : "+message);
    document.getElementById("Loading").classList.add("hidden");
}
function AddtoPanier(localarticle){
    console.log("Ajout au panier");
    console.log(localarticle);
    localarticle = JSON.parse(localarticle);
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
async function AffichePanier(){
    //récupère le panier dans le localstorage
    await CheckLocalStorage();
    //récupère la liste des cases déja coché si le panier est déjà affiché
    let cases = document.querySelectorAll('tbody label');
    let caseschecked = [];
    for (let i=0; i<cases.length; i++){
        if (cases[i].classList.contains("is-checked")){
            caseschecked.push(cases[i].parentNode.parentNode.childNodes[1].getAttribute("data-barcode"));
        }
    }
    console.log("cases checked : "+caseschecked)
    let localpanier = JSON.parse(localStorage.getItem("panier"));
    console.log("Ajout au panier");
    console.log(JSON.stringify(localpanier));
    //vériie si le panier est vide
    if (localpanier == null){
        document.getElementById("divpanier").classList.add("hidden");
        return;
    }
    let total = 0;
    let table=document.createElement("table");
    table.classList.add("mdl-data-table", "mdl-js-data-table", "mdl-data-table--selectable", "mdl-shadow--2dp");
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
        td.setAttribute("data-barcode", localpanier[id]["produit_barcode"]);
        tr.appendChild(td);
        td=document.createElement("td");
        td.innerHTML=localpanier[id]["quantite"];
        tr.appendChild(td);
        td=document.createElement("td");
        prix=parseFloat(localpanier[id]["quantite"]*localpanier[id]["produit_prix_vente"]).toFixed(2);
        td.innerHTML=prix;
        tr.appendChild(td);
        tbody.appendChild(tr);
        total += prix;
    }
    //ajout des event listeners sur les cases à cocher pour appeler la fonction de calcul du total
    table.appendChild(tbody);
    componentHandler.upgradeElement(table);
    document.getElementById("panier").innerHTML = "";
    document.getElementById("panier").appendChild(table);

    document.getElementById("divpanier").classList.remove("hidden");
    //ajout des event listeners sur les cases à cocher pour appeler la fonction de calcul du total
    document.querySelectorAll('table .mdl-checkbox__input').forEach(item => {
        item.addEventListener('change', CalculPanier)
    })
    //recoche les cases déja cochées précédemment si elles sont toujours dans le panier
    for (let i=0; i<caseschecked.length; i++){
        let checkbox = document.querySelector('table [data-barcode="'+caseschecked[i]+'"]');
        if (checkbox != null){
            console.log("case cochée : ");
            console.log(checkbox.parentNode.childNodes[0].childNodes[0]);
            checkbox.parentNode.childNodes[0].childNodes[0].classList.add("is-checked");
        }
    }
    CalculPanier();
}
//fonction pour supprimer le panier s'il est vide ou retirer les produits en rupture de stock ou dont leur quantité est supérieure au stock ou égal à 0
async function CheckLocalStorage() {
    // récupère le panier dans le localstorage
    let localpanier = JSON.parse(localStorage.getItem("panier"));

    // vérifie si le panier est vide
    if (localpanier == null || JSON.stringify(localpanier) == "{}") {
        // supprime le panier
        localStorage.removeItem("panier");
    } else {
        // tableau pour stocker toutes les promesses
        const promises = [];

        // parcours le panier
        for (let id in localpanier) {
            // vérifie si le produit est en stock
            // récupère le stock du produit avec l'API
            const promise = API_Get_Stock(id)
                .then(response => {
                    if (!response.ok) {
                        Display_Error("Erreur de la requête 2", "ScanUpdateProduct", response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.message == "Stock found") {
                        // affiche les infos dans le formulaire
                        let id = data.stock_barcode;
                        localpanier[id]["stock"] = data.stock_quantite;
                    } else {
                        console.log("Stock not found");
                        localpanier[id]["stock"] = 0;
                    }
                    if (localpanier[id]["stock"] <= 0) {
                        // supprime le produit du panier
                        delete localpanier[id];
                        console.log("Produit supprimé du panier");
                    }
                    else if (localpanier[id]["quantite"] > localpanier[id]["stock"]) {
                        // diminue la quantité du produit
                        localpanier[id]["quantite"] = localpanier[id]["stock"];
                    }
                });

            promises.push(promise);
        }

        // attend la résolution de toutes les promesses
        await Promise.all(promises);

        // enregistre le panier dans le localstorage après la résolution de toutes les promesses
        localStorage.setItem("panier", JSON.stringify(localpanier));
    }
}

function testpanier(){
    let localpanier = JSON.parse('{"52202023":{"produit_barcode":"52202023","produit_nom":"Cuvelier","produit_prix_achat":"100.00","produit_prix_vente":"150.00","message":"Product found","stock":14,"quantite":8},"53202023":{"produit_barcode":"53202023","produit_nom":"Produit2","produit_prix_achat":"100.00","produit_prix_vente":"10.00","message":"Product found","stock":8,"quantite":3}}');
    //mise en localstorage
    localStorage.setItem("panier", JSON.stringify(localpanier));
    AffichePanier();
}
function CalculPanier(){
    document.getElementById("valider").disabled = "disabled";
    document.getElementById("delete").disabled = "disabled";
    document.getElementById("moins").disabled = "disabled";
    document.getElementById("plus").disabled = "disabled";
    console.log("Calcul du panier");
    //calcul du total en fonction des cases cochées
    let total = 0;
    let nbarticles = 0;
    //récupère toute les cases cochées
    let cases = document.querySelectorAll('tbody label');
    //parcours toutes les cases cochées
    for (let i=0; i<cases.length; i++){
        if (cases[i].classList.contains("is-checked")){
            //récupère la quantité du produit
            let quantite = cases[i].parentNode.parentNode.childNodes[2].innerHTML;
            //récupère le prix du produit
            let prix = cases[i].parentNode.parentNode.childNodes[3].innerHTML;
            //ajoute le prix total au total
            total += parseFloat(prix);
            //ajoute la quantité au nombre d'articles
            nbarticles += parseFloat(quantite);
            //activer le bouton valider
            document.getElementById("valider").disabled = false;
            document.getElementById("delete").disabled = false;
            document.getElementById("moins").disabled = false;
            document.getElementById("plus").disabled = false;
        }
    }
    //affiche le total
    document.getElementById("total").innerHTML = "Total : "+parseFloat(total).toFixed(2);
}
//fonction pour demander la validation du panier et attendre la lecture du lecteur NFC
function CheckboxPanier(){
    navigator.notification.confirm("Metter la carte au dos du téléphone", CallBackCheckboxPanier, "Validation du panier", ["Ok", "Annuler"]);
}
function CallBackCheckboxPanier(buttonIndex){
    //si le bouton oui est cliqué alors appel de la fonction pour valider le panier
    if (buttonIndex == 1){
        ValiderPanier();
        document.getElementById("Loading").classList.remove("hidden");
    }
}
async function ValiderPanier(){
    //!!!!!!!!!!!!!!!!!ATTENTION!!!!!!!!!!!!!
    //Ne prend pas en compte les artciles cochés...
    
    //récupère le panier dans le localstorage, evoie les données au serveur et supprime le panier si la requête est ok
    //récupère le panier dans le localstorage
    await CheckLocalStorage();
    let localpanier = JSON.parse(localStorage.getItem("panier"));
    //vérie que le total du panier n'est pas suppérieur au nombre de consos de l'utilisateur -> attend la résolution de la promesse du lecteur NFC
    let user_infos = await GetNbConsosNFC();
    let nbconsos = parseFloat(user_infos.utilisateur_conso);
    let uid = user_infos.utilisateur_rfid_uid;
    let prix_cumul = 0;
    console.log("CONSOS AU DEPART : "+nbconsos);
    for (let id in localpanier){
        prix_cumul += parseFloat(localpanier[id]["quantite"])*parseFloat(localpanier[id]["produit_prix_vente"]/0.8);
    }
    prix_cumul=prix_cumul.toFixed(2);
    console.log("PRIX CUMUL : "+prix_cumul);
    if (prix_cumul > nbconsos){
        Display_Error("Vous n'avez pas assez de consos" ,"ValiderPanier","Vous n'avez pas assez de consos");
    }
    else{
        for (let id in localpanier){
            //envoie les données au serveur
            console.log("Envoie des données au serveur");
            console.log("UID : "+uid);
            console.log("ID : "+id);
            console.log("Quantité : "+localpanier[id]["quantite"]);
            API_Add_Vente(uid, id, localpanier[id]["quantite"])
            .then(response => {
                if (!response.ok) {
                    Display_Error("Erreur réseaux" ,"ValiderPanier",response.status);
                }
                return response.json();
            })
            .then(data => {
                if (data.message == "sale added") {
                    //affiche les infos dans le formulaire
                    console.log("Sale added");
                    console.log(JSON.stringify(data));
                }
                else{
                    Display_Error("Sale not added" ,"ValiderPanier",data);
                }
            })
            .catch(error => {
                Display_Error("Erreur inconnue" ,"ValiderPanier",error);
            });
        }
        localStorage.removeItem("panier");
        AffichePanier();
        alert("Vente effectuée");
    }
}
function ArticleAction(type){
    let cases = document.querySelectorAll('tbody label');
    //parcours toutes les cases cochées
    for (let i=0; i<cases.length; i++){
        //si la case est cochée
        console.log(cases[i]);
        if (cases[i].classList.contains("is-checked")){
            //récupère le barcode du produit
            let barcode = cases[i].parentNode.parentNode.childNodes[1].getAttribute("data-barcode");
            console.log(barcode);
            //supprime le produit du panier
            switch(type){
                case "delete":
                    DeleteArticle(barcode);
                    break;
                case "moins":
                    MoinsArticle(barcode);
                    break;
                case "plus":
                    PlusArticle(barcode);
                    break;
            }
        }
    }
}
function DeleteArticle(barcode){
    //récupère le panier dans le localstorage
    let localpanier = JSON.parse(localStorage.getItem("panier"));
    //supprime le produit du panier
    delete localpanier[barcode];
    //enregistre le panier dans le localstorage
    localStorage.setItem("panier", JSON.stringify(localpanier));
    //affiche le panier
    AffichePanier();
    CalculPanier();
}
function MoinsArticle(barcode){
    //récupère le panier dans le localstorage
    let localpanier = JSON.parse(localStorage.getItem("panier"));
    //diminue la quantité du produit si elle est supérieure à 1
    if (localpanier[barcode]["quantite"] > 1){
        localpanier[barcode]["quantite"] -= 1;
    }
    //enregistre le panier dans le localstorage
    localStorage.setItem("panier", JSON.stringify(localpanier));
    //affiche le panier
    AffichePanier();
    CalculPanier();
}
function PlusArticle(barcode){
    console.log("AJOUTER AU PANIER")
    //récupère le panier dans le localstorage
    let localpanier = JSON.parse(localStorage.getItem("panier"));
    //augmente la quantité du produit si elle est inférieure au stock
    if (localpanier[barcode]["quantite"] < localpanier[barcode]["stock"]){
        localpanier[barcode]["quantite"] += 1;
    }
    //enregistre le panier dans le localstorage
    localStorage.setItem("panier", JSON.stringify(localpanier));
    //affiche le panier
    AffichePanier();
    CalculPanier();
}
async function GetNbConsosNFC(){
    //récupère le nombre de consos de l'utilisateur avec le lecteur NFC
    //récupère l'uid du lecteur NFC
    try{
        var uid = await NFC_Read();
    }
    catch(error){
        Display_Error("Erreur lors de la lecture de la carte" ,"GetNbConsosNFC",error);
        //retourne une erreur de la promesse
        throw error;
    }
    //récupère les infos de l'utilisateur avec l'API
    console.log("UID : "+uid);
    return API_Get_User(uid)
    .then(response => {
        if (!response.ok) {
            Display_Error("Erreur réseau" ,"GetNbConsosNFC",response.status);
        }
        return response.json();
    })
    .then(data => {
        if (data.message == "User found") {
            //affiche les infos dans le formulaire
            console.log("User found");
            console.log(JSON.stringify(data));
            return data;
        }
        else{
            Display_Error("User not found" ,"GetNbConsosNFC",data);
        }
    })
    .catch(error => {
        Display_Error("Erreur inconnue" ,"GetNbConsosNFC",error);
    }
    );
}