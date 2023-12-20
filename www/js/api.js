//FONCTIONS API
function API_Get_User(uid){
    let url = "https://api.sae302.remcorp.fr/sae302-api/getUser.php?id="+uid;
    return fetch(url)    
  }
  function API_add_User(uid, nom, prenom, nbconsos){
    let url = "https://api.sae302.remcorp.fr/sae302-api/createUser.php?id="+uid+"&nom="+nom+"&prenom="+prenom+"&nbconso="+nbconsos;
    return fetch(url)
  }
  function API_Get_Product(barcode){
    let url = "https://api.sae302.remcorp.fr/sae302-api/getProduct.php?barcode="+barcode;
    return fetch(url)
  }
  function API_Add_Product(barcode, name, order_price, sell_price){
    let url = "https://api.sae302.remcorp.fr/sae302-api/createProduct.php?barcode="+barcode+"&nom="+name+"&prixachat="+order_price+"&prixvente="+sell_price;
    return fetch(url)
  }
  function API_Update_Product(barcode, name, order_price, sell_price){
    let url = "https://api.sae302.remcorp.fr/sae302-api/updateProduct.php?barcode="+barcode+"&nom="+name+"&prixachat="+order_price+"&prixvente="+sell_price;
    return fetch(url)
  }
  function API_Get_Stock(barcode){
    let url = "https://api.sae302.remcorp.fr/sae302-api/getStock.php?barcode="+barcode;
    return fetch(url)
  }
  function API_Add_Stock(barcode, stock){
    let url = "https://api.sae302.remcorp.fr/sae302-api/addStock.php?barcode="+barcode+"&stock="+stock;
    return fetch(url)
  }
  function API_Update_Stock(barcode, stock){
    let url = "https://api.sae302.remcorp.fr/sae302-api/updateStock.php?barcode="+barcode+"&stock="+stock;
    return fetch(url)
  }