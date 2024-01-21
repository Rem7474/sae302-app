//affichage des commandes passées a l'aide de requete api
const TEST = false;
document.addEventListener('deviceready', onDeviceReady, false);
console.log("Chargement de l'application");
AfficheCommandes()
//FONCTION : onDeviceReady
function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    
}
//EVENTS LISTENERS
function eventListeners(){  
    //Event pour vérifier si l'appareil est hors ligne
    document.addEventListener("offline", OffLineError, false);
  }
function OffLineError(){
    alert("Vous êtes hors ligne");
}

function AfficheCommandes(){
    document.getElementById("Loading").classList.remove("hidden");
    return API_Get_Ventes_Historique()
    .then(response => {
          if (!response.ok) {
               Display_Error("Erreur réseau" ,"AfficheArticles",response.status);
          }
          return response.json();
     })
     .then(data => {
         if (data.message == "Sales found") {
             //supprime data.message de data 
             delete data.message;
            //création de la table
            let table=document.createElement("table");
            table.classList.add("mdl-data-table");
            //création de l'entête
            let thead = document.createElement("thead");
            let tr = document.createElement("tr");
            let th = document.createElement("th");
            th.classList.add("mdl-data-table__cell--non-numeric");
            th.innerHTML = "Date";
            tr.appendChild(th);
            th = document.createElement("th");
            th.classList.add("mdl-data-table__cell--non-numeric");
            th.innerHTML = "Prénom";
            tr.appendChild(th);
            th = document.createElement("th");
            th.classList.add("mdl-data-table__cell--non-numeric");
            th.innerHTML = "Nom du produit";
            tr.appendChild(th);
            th = document.createElement("th");
            th.classList.add("mdl-data-table__cell--non-numeric");
            th.innerHTML = "Qt.";
            tr.appendChild(th);
            th = document.createElement("th");
            th.classList.add("mdl-data-table__cell--non-numeric");
            th.innerHTML = "Total";
            tr.appendChild(th);
            thead.appendChild(tr);
            table.appendChild(thead);
            //création du corps
            let tbody = document.createElement("tbody");
            //parcours de data
             let dataArray = Object.values(data);
             dataArray.forEach(element => {
                let tr = document.createElement("tr");
                let td = document.createElement("td");
                td.classList.add("mdl-data-table__cell--non-numeric");
                //conversion de la date en format français
                let date = new Date(element["vente_date"]);
                //format JJ/MM HH:MM
                let options = {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'};
                td.innerHTML = date.toLocaleDateString('fr-FR', options);
                tr.appendChild(td);
                td = document.createElement("td");
                td.classList.add("mdl-data-table__cell--non-numeric");
                td.innerHTML = element["utilisateur_prenom"];
                tr.appendChild(td);
                td = document.createElement("td");
                td.classList.add("mdl-data-table__cell--non-numeric");
                td.innerHTML = element["produit_nom"];
                tr.appendChild(td);
                td = document.createElement("td");
                td.classList.add("mdl-data-table__cell--non-numeric");
                td.innerHTML = element["vente_quantite"];
                tr.appendChild(td);
                td = document.createElement("td");
                td.classList.add("mdl-data-table__cell--non-numeric");
                td.innerHTML = parseFloat(element["produit_prix_vente"]*element["vente_quantite"]).toFixed(2);
                tr.appendChild(td);
                tbody.appendChild(tr);
                 
             });
                table.appendChild(tbody);
                document.getElementById("AfficheCommandes").appendChild(table);
                document.getElementById("Loading").classList.add("hidden");

         }
         else{
             Display_Error("Stock not found" ,"AfficheArticles",data);
         }
     })
     .catch(error => {
         Display_Error("Erreur inconnue" ,"AfficheArticles",error);
     }
     );
 }
 function Display_Error(message, fonction, details){
    if (!TEST){
    navigator.notification.alert(message, null, "Erreur de : "+fonction, "OK");
    }
    else{
        alert(message);
    }
    console.log(JSON.stringify(details));
    console.log("Erreur de :"+fonction+" : "+message);
    document.getElementById("Loading").classList.add("hidden");
}
