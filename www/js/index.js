//AUTHOR : Rémy CUVELIER
//DATE : 11/12/2023
//VERSION : 1.1
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


//EVENTS LISTENERS
function eventListeners(){
  //Boutons du menu principal
  let buttons = document.getElementsByClassName("main_button");
  for(let i = 0; i < buttons.length; i++){
    buttons[i].addEventListener("click", addAnimation, false);
  }
  //Bouton pour lancer le scan
  document.getElementById("scan").addEventListener("click", startScan, false);

  //Event pour vérifier si l'appareil est hors ligne
  document.addEventListener("offline", OffLineError, false);
}

//Initialisation et vérification des plugins et de l'API
function init(){
  //ETAPE 1 : Vérifier si le NFC est disponible
  nfc.enabled(
    function() {
        console.log("NFC est disponible!");
    },
    function() {
        console.log("NFC n'est pas disponible sur cet appareil.");
        Display_Error("NFC indisponible", "init", "NFC n'est pas disponible sur cet appareil.")
    }
  );
  //ETAPE 2 : vérifier l'état de l'API (si elle est disponible)
  
}
//FONCTION : onDeviceReady
function onDeviceReady() {
  console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
  /*--------------------------------------------------------------------------*/
  //EVENTS LISTENERS
  eventListeners();
  /*--------------------------------------------------------------------------*/
  //INITIALISATION
  init();
}


//animation ouverture des fenetres
function addAnimation(event){
  let button = event.currentTarget;

  //Animation de click
  button.classList.add("click");
  setTimeout(function(){
    button.classList.remove("click");
  }, 500);

  let target = event.currentTarget.id;
  switch(target){
    case "add_user":
      OpenWindow(target);
      //event pour valider le formulaire :
      document.getElementById("formulaire_add_user").addEventListener("submit", Add_User, false);
      updateForm("value",["","","",""],["card_uid", "user_name", "user_firstname", "user_nbconsos"]);
      if (!test){
        nfc.readerMode(
          nfc.FLAG_READER_NFC_A | nfc.FLAG_READER_NO_PLATFORM_SOUNDS, 
          nfcTag => {
            nfc.disableReaderMode(
              () => console.log('NFC reader mode disabled'),
              error => console.log('Error disabling NFC reader mode', error)
            );
            document.getElementById("card_uid").value = nfc.bytesToHexString(nfcTag.id);
            document.getElementById("card_uid_div").classList.add("is-dirty");
          },
          error => console.log('NFC reader mode failed', error)
        );
      }
      break;
    case "update_product":
      //update ou add d'un produit
      console.log("update_product");
      OpenWindow(target);
      //event pour valider le formulaire :
      document.getElementById("formulaire_update_product").addEventListener("submit", Update_Product, false);
      updateForm("value",["","","","",""],["barcode", "product_name", "product_order_price", "product_sell_price", "product_stock"]);
      //ouverture du scan de code barre
      if (!test){
        ScanUpdateProduct();
      }
      break;
    case "view_products":
      console.log("historique");
      break;
    case "view_users":
      JsBarcode("#barcode-container", "12345678", {
        format: "CODE39",
        displayValue: false,
      });
      updateForm("innerText",["uid carte rfid","NOM","NOM","Prénom","nombre consos"],["view_card_uid", "view_user_name","view_user_name2", "view_user_firstname", "view_user_nbconsos"]);
      updateForm("src",["img/profil.jpg"],["view_user_photo"]);
      OpenWindow(target);
      if (!test){
        nfc.readerMode(
          nfc.FLAG_READER_NFC_A | nfc.FLAG_READER_NO_PLATFORM_SOUNDS, 
          nfcTag => {
            //appelle de la fonction pour faire la requête ajax et afficher les infos de l'utilisateur
            nfc.disableReaderMode(
              () => console.log('NFC reader mode disabled'),
              error => console.log('Error disabling NFC reader mode', error)
            );
            document.getElementById("view_card_uid").innerText = nfc.bytesToHexString(nfcTag.id);
            console.log(nfcTag.id);
            //document.getElementById("view_card_uid_div").classList.add("is-dirty");
            view_User(nfc.bytesToHexString(nfcTag.id));
          },
          error => console.log('NFC reader mode failed', error)
        );
      }
      break;
    default:
      console.log("erreur");
      break;
  }
}



//FONCTIONS
//FONCTION : OffLineError
//DESCRIPTION : Affiche une erreur lorsque l'appareil est hors ligne
function OffLineError(){
  alert("Vous êtes hors ligne");
}
function OpenWindow(id){
  card = document.getElementById("card_"+id);
  card.classList.add("animation_form");
  card.classList.remove("hidden");
  //event pour fermer la fenetre :
  close = document.getElementById("cancel_"+id);
  close.addEventListener("click", CloseWindow, false);
  card.addEventListener("click", CloseWindow, false);
}
function CloseWindow(event){
  if(event.target.id == "card_add_user" || event.target.id == "cancel_add_user" || event.target.id =="formulaire_add_user"){ //a modifier pour fermeture quand envoie
    CloseAnimation("card_add_user");
    //reset du formulaire
    updateForm("value",["","","",""],["card_uid", "user_name", "user_firstname", "user_nbconsos"]);
    document.getElementById("formulaire_add_user").removeEventListener("submit", Add_User, false);
  }
  if(event.target.id == "card_view_users" || event.target.id == "cancel_view_users"){
    CloseAnimation("card_view_users");
    //reset du formulaire
    updateForm("innerText",["uid carte rfid","NOM","NOM","Prénom","nombre consos"],["view_card_uid", "view_user_name","view_user_name2", "view_user_firstname", "view_user_nbconsos"]);
    updateForm("src",["img/profil.jpg"],["view_user_photo"]);
    document.getElementById("view_user_photo").removeEventListener("click", PhotoCarte, false);
    JsBarcode("#barcode-container", "12345678", {
      format: "CODE39",
      displayValue: false,
    });
  }
  if(event.target.id == "card_update_product" || event.target.id == "cancel_update_product" || event.target.id =="formulaire_update_product"){ //a modifier pour fermeture quand envoie
    CloseAnimation("card_update_product");
    //reset du formulaire
    updateForm("value",["","","","",""],["barcode", "product_name", "product_order_price", "product_sell_price", "product_stock"]);
    document.getElementById("barcode").removeAttribute("data-api");
    document.getElementById("formulaire_update_product").removeEventListener("submit", Update_Product, false);
  }
}
function CloseAnimation(id){
  let card = document.getElementById(id);
  card.classList.remove("animation_form");
  card.classList.add("animation_form_close");
  setTimeout(function(){
    card.classList.add("hidden");
    card.classList.remove("animation_form_close");
  }, 475);
}
function updateForm(type,contenu,ids){
  //reset des valeurs
  div_ids=[];
  for (let i = 0; i < ids.length; i++){
    document.getElementById(ids[i])[type] = contenu[i];
    div_ids.push(ids[i]+"_div");
  }
  if (type == "value"){
    for (let i = 0; i < div_ids.length; i++){
      document.getElementById(div_ids[i]).classList.remove("is-dirty", "is-invalid", "is-upgraded");
    }
  }
  
}
function startScan(){
  console.log("startScan");
  cordova.plugins.barcodeScanner.scan(
  function (result) {
    //appel de la fonction pour ajouter au panier, avec le code barre en paramètre (+pour le premier article affiches les boutons de suppression et de validation)
    Ajout_panier(result.text);
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
function Add_User(event){
  event.preventDefault();
  //récupération des données du formulaire
  let uid= document.getElementById("card_uid").value;
  let nom = document.getElementById("user_name").value;
  let prenom = document.getElementById("user_firstname").value;
  let nbconsos = document.getElementById("user_nbconsos").value;
  document.getElementById("Loading").classList.remove("hidden");
  //appele de l'API
  API_add_User(uid, nom, prenom, nbconsos)
    .then(response => {
      document.getElementById("Loading").classList.add("hidden");
      if (!response.ok) {
        Display_Error("Erreur Réseau" ,"API_add_User",response.status);
      }
      return response.json();
    })
    .then(status => {
      if (status.message == "User added") {
        // Affichage de la confettis
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.8 }
        });
      } else {
        Display_Error("Erreur :" + status, "API_add_User", status);
      }
    })
    .catch(error => {
      Display_Error("Erreur Réseau", "API_add_User", error.message);
    })
    .finally(() => {
      CloseWindow(event);
    });

}
function view_User(uid){
  //appelle de la fonction pour afficher les infos de l'utilisateur
  //désactive le scan NFC
  document.getElementById("Loading").classList.remove("hidden");
  API_Get_User(uid)
    .then(response => {
      document.getElementById("Loading").classList.add("hidden");
      if (!response.ok) {
        Display_Error("Erreur Réseau" ,"view_User",response.status);
      }
      return response.json();
    })
    .then(data => {
      console.log(JSON.stringify(data));
      if (data.message == "User found") {
        //event pour modifier la photo de la carte
        document.getElementById("view_user_photo").addEventListener("click", PhotoCarte, false);
        JsBarcode("#barcode-container", data.utilisateur_rfid_uid, {
          format: "CODE39",
          displayValue: false,
        });
        document.getElementById("view_user_name").innerText = data.utilisateur_nom;
        document.getElementById("view_user_name2").innerText = data.utilisateur_nom;
        document.getElementById("view_user_firstname").innerText = data.utilisateur_prenom;
        document.getElementById("view_user_nbconsos").innerText = data.utilisateur_conso;
        //test si photo dans le local storage
        if (localStorage.getItem(data.utilisateur_rfid_uid.toUpperCase()) !== null) {
          document.getElementById("view_user_photo").src = localStorage.getItem(data.utilisateur_rfid_uid.toUpperCase());
        }
      }
      else{
        Display_Error("Erreur :" + data.message, "view_User", data.message);
      }
    })
    .catch(error => {
        Display_Error("Erreur :" + error, "view_User", error);
    });

}
function Update_Product(event){
  event.preventDefault();
  //récupérer les infos sur les modifications
  let infos = document.getElementById("barcode").getAttribute("data-api");
  let data = dataFormulaire("get",["barcode","product_name","product_order_price","product_sell_price","product_stock"]);
  let modified = false;
  console.log("ici c'est paris : "+infos);
  switch(infos){
    case "produit":
      //créer le produit et le stock
      document.getElementById("Loading").classList.remove("hidden");
      API_Add_Product(data[0][0], data[0][1], data[0][2], data[0][3])
        .then(response => {
          if (!response.ok) {
            document.getElementById("Loading").classList.add("hidden");
            Display_Error("Erreur Réseau" ,"Update_Product",response.status);
          }
          return response.json();
        })
        .then(status => {
          if (status.message == "Product added") {
            //créer le stock
            API_Add_Stock(data[0][0], data[0][4])
              .then(response => {
                document.getElementById("Loading").classList.add("hidden");
                if (!response.ok) {
                  Display_Error("Erreur Réseau" ,"Update_Product",response.status);
                }
                return response.json();
              })
              .then(status => {
                if (status.message == "Stock added") {
                  // Affichage de la confettis
                  confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.8 }
                  });
                } else {
                  Display_Error("Erreur :" + status, "Update_Product", status);
                }
              })
              .catch(error => {
                Display_Error("Erreur Réseau", "Update_Product", error.message);
              }
            );
          } else {
            document.getElementById("Loading").classList.add("hidden");
            Display_Error("Erreur :" + status, "Update_Product", status);
          }
        })
        .catch(error => {
          Display_Error("Erreur Réseau", "Update_Product", error.message);
        }
      );
      break;
    case "stock":
      //créer le stock et mettre a jour le produit si besoin
      document.getElementById("Loading").classList.remove("hidden");
      API_Add_Stock(data[0][0], data[0][4])
        .then(response => {
          document.getElementById("Loading").classList.add("hidden");
          if (!response.ok) {
            Display_Error("Erreur Réseau" ,"Update_Product",response.status);
          }
          return response.json();
        })
        .then(status => {
          if (status.message == "Stock added") {
            //test si le produit a été modifié
            modified = checkChange(data);
            if (modified){
              API_Update_Product(data[0][0], data[0][1], data[0][2], data[0][3])
              .then(response => {
                document.getElementById("Loading").classList.add("hidden");
                if (!response.ok) {
                  Display_Error("Erreur Réseau" ,"Update_Product",response.status);
                }
                return response.json();
              }
              )
              .then(status => {
                if (status.message == "Product updated") {
                  // Affichage de la confettis
                  confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.8 }
                  });
                } else {
                  Display_Error("Erreur :" + status, "Update_Product", status);
                }
              })
            }
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.8 }
            });
          } else {
            document.getElementById("Loading").classList.add("hidden");
            Display_Error("Erreur :" + status, "Update_Product", status);
          }
        })
        .catch(error => {
          Display_Error("Erreur Réseau", "Update_Product", error.message);
        }
      );
      break;
    case "all":
      //vérifier les modifications du produit
      modified = checkChange(data);
      if (modified){
        document.getElementById("Loading").classList.remove("hidden");
        API_Update_Product(data[0][0], data[0][1], data[0][2], data[0][3])
        .then(response => {
          document.getElementById("Loading").classList.add("hidden");
          if (!response.ok) {
            Display_Error("Erreur Réseau" ,"Update_Product",response.status);
          }
          return response.json();
        }
        )
        .then(status => {
          if (status.message == "Product updated") {
            // Définition d'une variable pour savoir si une modification a été faite pour afficher la confettis
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.8 }
            });
          } else {
            Display_Error("Erreur :" + status, "Update_Product", status);
          }
        })
        .catch(error => {
          Display_Error("Erreur Réseau", "Update_Product", error.message);
        }
      );
      }
      //vérifier les modifications du stock
      if (data[0][4] != data[1][4]){
        modified = true;
        document.getElementById("Loading").classList.remove("hidden");
        API_Update_Stock(data[0][0], data[0][4])
          .then(response => {
            document.getElementById("Loading").classList.add("hidden");
            if (!response.ok) {
              Display_Error("Erreur Réseau" ,"Update_Product",response.status);
            }
            return response.json();
          })
          .then(status => {
            if (status.message == "Stock updated") {
              // Définition d'une variable pour savoir si une modification a été faite pour afficher la confettis
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.8 }
              });
            } else {
              Display_Error("Erreur :" + status, "Update_Product", status);
            }
          })
          .catch(error => {
            Display_Error("Erreur Réseau", "Update_Product", error.message);
          }
        );
      }
      break;
    default:
      //aucune modification
      break;
  }
  CloseWindow(event);
}
function checkChange(data){
  let modified = false;
  let i=1;
  while (modified == false && i < data[0].length-1){
    if (data[0][i] != data[1][i]){
      modified = true;
    }
    i++;
  }
  return modified;
}

function Display_Error(message, fonction, details){
  alert(message);
  console.log(details);
  console.log("Erreur de :"+fonction);
}
function ScanUpdateProduct(){
  //ouverture du scan de code barre puis appel de la fonction pour récupérer les infos du produit
  cordova.plugins.barcodeScanner.scan(
    function (result) {
      //appelle de la fonction pour récupérer les infos du produit
      console.log("résultat du scan : "+result.text)
      document.getElementById("barcode").value = result.text;
      document.getElementById("barcode_div").classList.add("is-dirty");
      document.getElementById("Loading").classList.remove("hidden");
      API_Get_Product(result.text)
        .then(response => {
        if (!response.ok) {
          Display_Error("Erreur Réseau" ,"ScanUpdateProduct",response.status);
        }
        return response.json();
      })
        .then(data => {
          if (data.message == "Product found") {
            //affiche les infos dans le formulaire

            dataFormulaire("set",["product_name","product_order_price","product_sell_price"],[data.produit_nom, data.produit_prix_achat, data.produit_prix_vente]);
            //avant l'envoie du formulaire vérifier ce qui a été changé par rapport a data
            //récupérer stock
            API_Get_Stock(data.produit_barcode)
              .then (response => {
                document.getElementById("Loading").classList.add("hidden");
                if (!response.ok) {
                  Display_Error("Erreur Réseau" ,"ScanUpdateProduct",response.status);
                }
                return response.json();
              })
              .then(data => {
                if (data.message == "Stock found") {
                  let product_stock=document.getElementById("product_stock");
                  product_stock.value = data.stock_quantite;
                  product_stock.setAttribute("data-original", data.stock_quantite);

                  let product_stock_div=document.getElementById("product_stock_div");
                  product_stock_div.classList.add("is-dirty");
                  product_stock_div.classList.remove("is-invalid");

                  document.getElementById("barcode").setAttribute("data-api", "all") //si data-api = all alors il faut vérifier quoi modifier (produit ou stock)
                }
                else{
                  //laisse l'utilisateur remplir le formulaire en sachant qu'il faudra créer le stock
                  document.getElementById("barcode").setAttribute("data-api", "stock") //si data-api = stock alors il faut créer le stock
                }
              })
              .catch(error => {
                  //ERROR réseau
              });
          }
          else{
            document.getElementById("barcode").setAttribute("data-api", "produit") //si data-api = produit alors il faut créer le produit et le stock
            document.getElementById("Loading").classList.add("hidden");
            //laisse l'utilisateur remplir le formulaire en sachant qu'il faudra créer le produit
          }
        })
        .catch(error => {
            //ERROR réseau
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

function PhotoCarte(){
  navigator.camera.getPicture(onPhotoSuccess, onPhotoFail, {
    quality: 50,
    destinationType: Camera.DestinationType.DATA_URL,
    encodingType: Camera.EncodingType.JPEG,
    targetWidth: 500,
    targetHeight: 500,
  });
}
function onPhotoSuccess(imageData) {
  // imageData contient les données de l'image (base64)
  // Enregistrez imageData dans les données de votre application (par exemple, localStorage)
  let uid=document.getElementById("view_card_uid").innerText;
  console.log("dans le innerText : "+uid);
  localStorage.setItem(uid, "data:image/jpeg;base64," + imageData);
  document.getElementById("view_user_photo").src = localStorage.getItem(uid);
  
}

function onPhotoFail(message) {
  console.log("Échec de la capture de la photo: " + message);
}

function dataFormulaire(method, ids, data = []){
  if (method == "set"){
    for (let i = 0; i < ids.length; i++){
      let element = document.getElementById(ids[i]);
      element.value = data[i];
      element.setAttribute("data-original", data[i]);
      let parent=element.parentElement;
      parent.classList.add("is-dirty");
      parent.classList.remove("is-invalid");
    }
  }
  else if (method == "get"){
    let original = [];
    for (let i = 0; i < ids.length; i++){
      let element = document.getElementById(ids[i]);
      data.push(element.value);
      original.push(element.getAttribute("data-original"));
    }
    return [data, original];
  }
}

