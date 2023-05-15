// Url utilisés
const urlinscription = "https://trankillprojets.fr/P4/?inscription&pseudo=";
const urlparticiper = "https://trankillprojets.fr/P4/?participer&identifiant=";
const urlstatut = "https://trankillprojets.fr/P4/?statut&identifiant=";
const urlabandon = "https://trankillprojets.fr/P4/?abandonner&identifiant=";
const urljouer = 'https://trankillprojets.fr/P4/?jouer&position=';
let comptesStock ="";

let identifiant ="";
let joueur ="";
let adversaire ="";
let myturn ="";
let actualturn ="";

// Décompte avant une partie
let countdownTimer;
let countdownInterval;

let player1color = "#1900ef";
let player2color = "#E3170A";
let bglight= "#F2F2F2";

// Affichage formulaire
function inscriptionForm(){
  //document.getElementById("main").setAttribute('style','display:none')
  const ipAPI = '//api.ipify.org?format=json'

  const inputValue = fetch(ipAPI)
    .then(response => response.json())
    .then(data => data.ip)
    .catch((error) => {
      console.error("Erreur lors de la récupération de l'adresse IP:", error);
      return ""; // Valeur par défaut en cas d'erreur
    });

  const { value: ipAddress } = Swal.fire({
    confirmButtonColor: '#1900EF',
    cancelButtonColor: '#E3180B',
    title: 'Votre pseudo de joueur',
    input: 'text',
    inputLabel: 'Veuillez saisir votre pseudo',
    inputValue: inputValue,
    confirmButtonText: 'Valider',
    cancelButtonText: 'Annuler',
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return 'Veuillez ne pas laisser le formulaire vide'
      }
      // Si le formulaire n'est pas vide
      if(value){
        // Si le pseudo est valide d'après ma fonction de vérification de pseudo
        if (validerPseudo(value) == true) {
            fetch(urlinscription+value)
            .then(response => response.json())
            .then(data => {
              joueur = data.pseudo;
              if (data.etat === "OK") {
                identifiant = data.identifiant;
                saveToLocalStorage(identifiant,joueur);
                Swal.fire({
                  icon: 'success',
                  title: 'Pseudo validé',
                  html: `Veuillez retenir ou copier votre identifiant : <a href="#" onclick="idCopy();">${identifiant}</a>`,
                  confirmButtonColor: '#E3180B',
                  confirmButtonText: 'Valider',
                  footer: "<button class='custom-btn btn-1' onclick='idCopy()'>Copier mon identifiant</button>",
                }).then((result) => {
                  if (result.isConfirmed) {
                    state();
                    setTimeout(() => {
                      Swal.fire({
                        title: 'Jouer une nouvelle partie ?',
                        text: "Affrontez un adversaire dans un duel ♟️",
                        icon: 'success',
                        showCancelButton: true,
                        confirmButtonColor: '#1900EF',
                        cancelButtonColor: '#E3180B',
                        confirmButtonText: 'Rechercher une partie ⚔️',
                        cancelButtonText: 'Retour au menu'
                      }).then((result) => { 
                        
                        if (result.isConfirmed) {
                          Swal.fire({
                            position: 'center',
                            icon: 'success',
                            title: 'Redirection vers la page de recherche de partie',
                            showConfirmButton: false,
                            timer: 1500
                          });
            
                          // Appel de la fonction verifstatut après la fin du timer
                          setTimeout(() => {
                            verifstatut();
                          }, 1500);
                        }
                      });
                    }, 1000); 
                  }
                }).then(() =>  {
                  isConnected();
                }, 6000); // Modifiez cette valeur pour changer le délai;
              }
              else{
                Swal.fire({
                  icon: 'error',
                  title: 'Erreur de pseudo',
                  text: "Le pseudo saisi n'est pas disponible",
                })
                .then((result) => {
                  inscriptionForm();
                });
              }
              
            })
            .catch(error => console.error(error)); 
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Erreur de pseudo',
            text: "Le pseudo saisi n'est pas disponible",
          })
          .then((result) => {
            inscriptionForm();
          });
        }
      }
    }
  })
  }

// Affiche les choix de fin de parties
function partieFin(){
  
  // rafraichi l'état de l'id
  state();

  // Appel de la nouvelle fenêtre modale après la fin du timer
  setTimeout(() => {
    Swal.fire({
      title: "Options",
      text: 'Choisissez ce que vous voulez',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1900EF',
      cancelButtonColor: '#E3180B',
      confirmButtonText: 'Chercher une autre partie 🔍',
      cancelButtonText: 'Retour au menu principal'
    }).then((result) => {
      if (result.isConfirmed) {
        // Fonction à exécuter lorsque le bouton recherche est cliqué
        verifstatut(identifiant);
      } else {
        // Fonction à exécuter lorsque le menu principal est cliqué
        document.getElementById("plateau").setAttribute('style', 'display:none');
        document.getElementById("main").setAttribute('style', 'display:block');
      }
    });
  }, 1500);
}

// Copy l'ID du joueur
function idCopy() {
  isConnected();
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  Toast.fire({
    icon: 'success',
    title: 'Identifiant copié',
  });
  navigator.clipboard.writeText(identifiant);
  setTimeout(() => {
    Swal.fire({
      title: 'Jouer une nouvelle partie ?',
      text: "Affrontez un adversaire dans un duel ♟️",
      icon: 'success',
      showCancelButton: true,
      confirmButtonColor: '#1900EF',
      cancelButtonColor: '#E3180B',
      confirmButtonText: 'Rechercher une partie ⚔️',
      cancelButtonText: 'Retour au menu'
    }).then((result) => { 
      
      if (result.isConfirmed) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Redirection vers la page de recherche de partie',
          showConfirmButton: false,
          timer: 1500
        });

        // Appel de la fonction verifstatut après la fin du timer
        setTimeout(() => {
          verifstatut(identifiant);
        }, 1500);
      }
    });
  }, 1500);
}
function matchMaking(){
  fetch(urlparticiper + identifiant);
}

async function verifstatut() {
  // Affiche la vue de recherche d'adversaire
  document.getElementById("status").innerHTML = "Recherche d'un adversaire en cours";
  document.getElementById("main").setAttribute('style', 'display:none');
  document.getElementById("plateau").setAttribute('style', 'display:none');
  document.getElementById("search-player").setAttribute('style', 'display:block');
  
  //Lance la recherche d'un adversaire
  matchMaking();

  let adversaireTrouve = false;

  // Vérifier toutes les secondes si un adversaire a été trouvé
  while (!adversaireTrouve) {
    try {
      const response = await fetch(urlstatut + identifiant);
      const data = await response.json();
      //console.log(data.etat);

      // Vérifier si le statut est "partie" ou "termine"
      if (data.etat === "En cours") {
        console.log("Adversaire trouvé !");
        document.getElementById("status").innerHTML = "Adversaire trouvé !";
        document.getElementById("infos-play").setAttribute('style', 'display:block');
        document.getElementById("infos-play-child").setAttribute('style','display:block');
        adversaireTrouve = true;
        adversaire = data.adversaire;
        console.log("Votre adversaire est : " + adversaire);
        myturn = data.joueur;  
        actualturn = "1";  
        decompte();
      } 

      // Cas ou l'attente de 2 minutes passé arrive la modale s'ouvre pour proposer de chercher une partie ou revenir au menu
      else if (data.etat === "Attente supprimee") {
        state();
        document.getElementById("infos-play").setAttribute('style', 'display:none');
        document.getElementById("search-player").setAttribute('style', 'display:none');
        document.getElementById("infos-play-child").setAttribute('style','display:none');
        setTimeout(() => {
          Swal.fire({
            title: "Pas d'adversaire trouvé",
            text: "Lancer une autre recherche ?",
            icon: 'success',
            showCancelButton: true,
            confirmButtonColor: '#1900EF',
            cancelButtonColor: '#E3180B',
            confirmButtonText: 'Rechercher une partie ⚔️',
            cancelButtonText: 'Retour au menu'
          })
          .then((result) => { 
            
            if (result.isConfirmed) {
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Redirection vers la page de recherche de partie',
                showConfirmButton: false,
                timer: 1500
              });
      
              // Appel de la fonction verifstatut après la fin du timer
              setTimeout(() => {
                verifstatut();
              }, 1500);
            }
            else{
              document.getElementById("main").setAttribute('style', 'display:block');
            }
          });
        }, 1000); 
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du statut :", error);
    }

    // Attendre une seconde avant de vérifier à nouveau
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Rafraichi le statut
async function state() {
  try {
    const response = await fetch(urlstatut+identifiant);
    const data = await response.json();
    return data.statut;
  } catch (error) {
    console.error("Erreur lors de la vérification du statut :", error);
    return null;
  }
}


// Timer avant après avoir trouvé un adversaire
function decompte() {
  // Annule le timer précédent s'il existe
  if (countdownTimer) {
    clearTimeout(countdownTimer);
  }

  // Annule l'intervalle précédent s'il existe
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  // Affiche le temps restant
  const countdownElement = document.getElementById("countdown");
  let timeLeft = 15;
  countdownElement.innerHTML = timeLeft;

  countdownInterval = setInterval(() => {
    timeLeft--;
    countdownElement.innerHTML = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      playGame();
    }
  }, 1000);
}


// Permet à un joueur de se connecter avec id créé auparavant
function connexion(){
state();
  // Pas important juste là pour la performance du site
const ipAPI = '//api.ipify.org?format=json'

const inputValue = fetch(ipAPI)
  .then(response => response.json())
  .then(data => data.ip)
  .catch((error) => {
    console.error("Erreur lors de la récupération de l'adresse IP:", error);
    return ""; // Valeur par défaut en cas d'erreur
  }); 

const { value: idPlayer } = Swal.fire({
  title: 'Entrez votre identifiant',
  input: 'text',
  inputLabel: 'Votre identifiant',
  inputValue: inputValue,
  confirmButtonColor: '#1900EF',
  cancelButtonColor: '#E3180B',
  html: '<div id="connect-windows"></div>',
  showCancelButton: true,
  inputValidator: (value) => {
    if (!value) {
      return 'Vous devez écrire quelque chose !'
    }
    if (value){
      connect(value);
    }

  }
})
estComptesStockNonVide();
}

// Connecte le joueur avec un id existant avec le bouton Connect
async function connect(value){
  // Vérifie si l'identifiant existe
  let statutResponse = await fetch(`https://trankillprojets.fr/P4/?statut&identifiant=`+value);
  identifiant=value;
  let statutJson = await statutResponse.json();
  let etat = statutJson.etat;
  joueur = statutJson.pseudo;
  if (etat === "OK") {
    isConnected();
    // Changement de l'url du bouton de recherche de partie
    Swal.fire({
      title: 'Identification vérifiée',
      text: "Nous sommes ravis de vous revoir !",
      icon: 'success',
      showCancelButton: true,
      confirmButtonColor: '#1900EF',
      cancelButtonColor: '#E3180B',
      confirmButtonText: 'Rechercher une partie ⚔️',
      cancelButtonText: 'Retour au menu',
    }).then((result) => { 
      
      if (result.isConfirmed) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Redirection vers la page de recherche de partie',
          showConfirmButton: false,
          timer: 1500
        });

        // Appel de la fonction verifstatut après la fin du timer
        setTimeout(() => {
          verifstatut(value);
        }, 1500);
      }
    })

  } else {
    // L'identifiant n'existe pas, effectue une autre action ici
    //console.log(`L'identifiant ${identifiant} n'existe pas.`);
    Swal.fire({
      position: 'center',
      icon: 'error',
      title: `L'identifiant n'existe pas ou est déjà dans une partie.`,
      showConfirmButton: false,
      timer: 1500
    })
  }

}

// Fonction regex de vérification du pseudo entré 
function validerPseudo(pseudo) {
  const pseudoRegex = /^[a-zA-Z0-9_\-]{3,20}$/;
  return pseudoRegex.test(pseudo);
} 

// Abandon
function abandon() {
  state();
  Swal.fire({
    title: "Quitter la partie en cours ?",
    text: "Vous abandonnez la partie en cours",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#1900EF',
    cancelButtonColor: '#E3180B',
    confirmButtonText: 'Confirmer'
  }).then((result) => {
    
    // Fetch abandon
    if (result.isConfirmed) {
      fetch(urlabandon + identifiant)
        .then(response => response.json())
        .then(data => {
          console.log(data.etat);
        })
        .catch(error => console.error(error));
      Swal.fire({
        showConfirmButton: false,
        timer: 1500,
        icon: 'success',
        title: 'Fin de la partie',
        text: 'Vous avez quitté la partie',
      });
      state();
      partieFin();
      
    }
    // Fin fetch abandon
  });
}

//Changement de couleur
function changeColor(color){
  let elementsCase = document.querySelectorAll('.case');
  var caseColor ="";
  elementsCase.forEach(element => {
    caseColor=element.style.backgroundColor
    element.addEventListener('mouseover', () => {
      element.style.backgroundColor = color; 
    });
  
    element.addEventListener('mouseleave', () => {
      element.style.backgroundColor = caseColor; 
    });
  });
}


// Affiche la grille
function playGame(){
state();
  // Affichage nom du joueur actif en début de partie et de la couleur du background au survol de la souris 
  if (myturn === "1"){
    document.getElementById('player').innerText = joueur;
    changeColor(player1color);
  }
  else if (myturn === "2"){
    document.getElementById('player').innerText = adversaire;
    changeColor(player2color);
  }

// Affiche la grille  
        document.getElementById("infos-play").setAttribute('style','display:none');
        document.getElementById("infos-play-child").setAttribute('style','display:none');
        document.getElementById("main").setAttribute('style','display:none');
        document.getElementById("search-player").setAttribute('style','display:none');
        document.getElementById("plateau").setAttribute('style','display:block');

        const cases = document.querySelectorAll('.case');
        cases.forEach(caseElement => {
          caseElement.style.backgroundColor = '#F2F2F2';
        });
        checkAdversaire();
}

// Ce qui se passe quand un utilisateur se connecte
function isConnected(){

// Changement du titre de la fenêtre
document.title = "🔵4 | "+ joueur; 

// Affichage du pseudo du joueur au Menu principal
const choix = ["👋", "🫡", "🥳", "🍾", "🎉", "🕹️", "🎮", "🤗", "🤪", "😋", "😊", "😎", "🤩", "😼", "😸"];
function choisirAleatoire() {
const indexAleatoire = Math.floor(Math.random() * choix.length);
return choix[indexAleatoire];
}
const emotion = choisirAleatoire();
document.getElementById("pseudo-player").innerHTML= "Bienvenue "+joueur +" "+ emotion;

// Affiche le bouton de matchmaking 
let playMain = document.getElementById("playmain");
playMain.style.display = "block";

var playButton = document.getElementById("play");
playButton.onclick = function() {
// Appeler la fonction "playGame" avec le paramètre "identifiant"
  verifstatut();
};

  
}

// Enregistrer un compte dans le navigateur
function saveToLocalStorage(identifiant, pseudo) {
  comptesStock = localStorage.getItem('listedeComptes');

  if (comptesStock) {
    comptesStock = JSON.parse(comptesStock);
  } 
  
  else {
    comptesStock = [];
  }
  comptesStock.push({ identifiant, pseudo });
  localStorage.setItem('listedeComptes', JSON.stringify(comptesStock));
  console.log (JSON.stringify(comptesStock));
}

// Suppression de tous les comptes
function clearAccounts() {
  Swal.fire({
    title: 'Supprimer tous les comptes ?',
    showCancelButton: true,
    confirmButtonText: 'Valider',
    denyButtonText: `Don't save`,
    cancelButtonText:'Annuler',
    confirmButtonColor: '#1900EF',
    cancelButtonColor: '#E3180B',

  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      localStorage.removeItem('listedeComptes');
      Swal.fire('Suppression effecuté', '', 'success')
    }
  })
}

// Suppression d'un compte
function supprimerCompte(id) {

  // Récupérer la liste des comptes du localStorage
  const comptesStock = JSON.parse(localStorage.getItem('listedeComptes'));

  // Vérifier si comptesStock existe et s'il n'est pas vide
  if (comptesStock && comptesStock.length > 0) {

    // Filtrer les comptes pour supprimer celui avec l'identifiant spécifié
    const comptesFiltres = comptesStock.filter((compte) => compte.identifiant !== id);

    // Mettre à jour la liste des comptes dans le localStorage
    localStorage.setItem('listedeComptes', JSON.stringify(comptesFiltres));
  } else {
    console.log("Aucun compte à supprimer dans la liste des comptes.");
  }
}

// Vérifie si la liste des comptes enregistré est vide
function estComptesStockNonVide() {
  // Récupérer la liste des comptes du localStorage
  const comptesStock = localStorage.getItem('listedeComptes');
  const boutonSuppression = document.createElement('button');
  boutonSuppression.textContent = 'Supprimer tous les comptes';
  boutonSuppression.classList.add('suppression-btn');
  boutonSuppression.id = 'suppression-btn-all';

  // Vérifier si comptesStock existe et s'il n'est pas vide
  if (comptesStock && comptesStock.length > 2 ) {
    // Ajouter le bouton à l'élément avec l'ID "connect-windows"
  const connectWindows = document.getElementById('connect-windows');

  // Quand on clique sur le bouton supprimer compte
  boutonSuppression.addEventListener('click', () => {
    // Fonction de suppression
    clearAccounts();
  });
    // Utiliser la fonction pour créer des boutons pour chaque pseudo
    creerBoutonsPourPseudos();
    connectWindows.appendChild(boutonSuppression);
    return true;
  } else {
    connectWindows.removeChild(boutonSuppression);
    return false;
  }
}

// Créé des boutons pour chaques identifiants enregistré en local
function creerBoutonsPourPseudos() {  
  // Récupérer la liste des comptes du localStorage
  const comptesStock = JSON.parse(localStorage.getItem('listedeComptes'));

  // Vérifier si comptesStock existe et s'il n'est pas vide
  if (comptesStock && comptesStock.length > 0) {
    
    // Parcourir la liste des comptes et créer des boutons pour chaque pseudo
    comptesStock.forEach((compte) => {

      // Créer un nouveau bouton
      const bouton = document.createElement('button');
      bouton.title = "Connexion au compte";
      const buttondelete = document.createElement('buttondelete');
      buttondelete.title = "Suppression du compte";
      buttondelete.textContent = "";
      bouton.textContent = compte.pseudo;
      bouton.classList.add('compte-connect');
      buttondelete.className = 'suppression-btn';

      // Clic sur le bouton de suppresion
      buttondelete.onclick = function() {

        Swal.fire({
          title: 'Vous confirmez la suppression du compte : '+compte.pseudo,
          showCancelButton: true,
          confirmButtonText: 'Valider',
          cancelButtonText:'Annuler',
          confirmButtonColor: '#1900EF',
          cancelButtonColor: '#E3180B',
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            supprimerCompte(compte.identifiant);
            console.log('suppresion du compte'+compte.pseudo);
            buttondelete.setAttribute('style','display:none');
            bouton.setAttribute('style','display:none');
            Swal.fire('Suppression effecuté', '', 'success')
          }
        })
      };


      // Connexion à un compte avec les boutons générés
      bouton.addEventListener('click', () => {
        Swal.fire({
          title: 'Validez la connexion ?',
          text: "Vous validez la connexion au compte : "+compte.pseudo,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#1900EF',
          cancelButtonColor: '#E3180B',
          confirmButtonText: 'Connexion',
          cancelButtonText:'Annuler',
        }).then((result) => {
          if (result.isConfirmed) {
            connect(compte.identifiant);
            Swal.fire(
              'Connexion effectué',
              'Votre compte est maintenant connecté',
              'success'
            )
          }
        })
      });

      // Récupération de la fenêtre d'affichage des boutons
      const listePseudos = document.getElementById('connect-windows');
      listePseudos.appendChild(bouton);
      listePseudos.appendChild(buttondelete);
      
    });
  }
      
}




// a3d7cf820f272b2c1dd226a784642283090a05d59b3ef04b2e9291c900397e59



// Vérifier l'état du jeu toutes les secondes (1000 millisecondes)
const intervalId = setInterval(checkAdversaire, 1000);
let lignes = [6, 6, 6, 6, 6, 6, 6]; 
var ligne = "";
const cols = document.querySelectorAll('.case');
        // Changement quand je clique
        cols.forEach(col => {
          col.addEventListener('click', async (e) => {
  
        if (actualturn===myturn) {
          var colonne = e.currentTarget.parentElement.getAttribute('data-value');
          ligne = lignes[colonne];
          
          if (ligne>0){  
          const caseId = "c" + colonne + ligne;
          console.log (caseId);
          const caseElement = document.getElementById(caseId);
  
          if (myturn === "1") {
            caseElement.style.backgroundColor = player1color;
          } 
          
          else if (myturn === "2") {
            caseElement.style.backgroundColor = player2color;
          }
          caseElement.classList.add('animate__backInDown');

          var sendCol = parseInt(colonne) + 1;

          jouer(sendCol,lignes);
          console.log("Colonne : "+colonne+" Ligne : "+ligne);
          }
          
          else{
            Swal.fire({
              icon: 'error',
              title: 'Impossible de jouer cette case',
              text: `Veuillez rejouer`,
              confirmButtonColor: '#E3180B',
              confirmButtonText: 'Valider',
            })
          }
        }
        
      });
    });
async function checkAdversaire() {
 
  try {
    const response = await fetch(urlstatut + identifiant);
    const data = await response.json();

    // Vérifier les conditions de fin de partie
    if (data.etat === 'joueur 1 gagne' || data.etat === 'joueur 2 gagne' || data.etat === 'Abandon') {
      // Si l'une des conditions de fin de partie est remplie, arrêter de vérifier
      clearInterval(intervalId);
      console.log('Fin de la partie:', data.etat);

      // Effectuer des actions en fonction du résultat de la partie
      if (data.etat === 'joueur 1 gagne' && myturn === '1') {
        Swal.fire({
          title: 'Victoire',
          text: 'Vous avez gagner',
          imageUrl: 'img/winner.gif',
          imageWidth: 300,
          imageHeight: 300,
          imageAlt: 'Custom image',
          confirmButtonColor: '#E3180B',
          onClose: () => {
          },
        }).then(function () {
          partieFin();
        });
        // Actions à effectuer si le joueur 1 gagne et myturn est égal à 1
      } else if (data.etat === 'joueur 1 gagne' && myturn !== '1') {
        // Actions à effectuer si le joueur 1 gagne et myturn n'est pas égal à 1
        Swal.fire({
          title: 'Défaite',
          text: 'Vous avez perdu',
          imageUrl: 'img/looser.gif',
          imageWidth: 300,
          imageHeight: 300,
          imageAlt: 'Custom image',
          confirmButtonColor: '#E3180B',
        }).then(function () {
          partieFin();
        });
      } 
      else if (data.etat === 'joueur 2 gagne' && myturn === '2') {
        // Actions à effectuer si le joueur 1 gagne et myturn n'est pas égal à 1
        Swal.fire({
          title: 'Victoire',
          text: 'Vous avez gagner',
          imageUrl: 'img/winner.gif',
          imageWidth: 300,
          imageHeight: 300,
          imageAlt: 'Custom image',
          confirmButtonColor: '#E3180B',
        }).then(function () {
          partieFin();
        });
      } 
      else if (data.etat === 'joueur 2 gagne' && myturn !== '2') {
        // Actions à effectuer si le joueur 1 gagne et myturn n'est pas égal à 1
        Swal.fire({
          title: 'Défaite',
          text: 'Vous avez perdu',
          imageUrl: 'img/looser.gif',
          imageWidth: 300,
          imageHeight: 300,
          imageAlt: 'Custom image',
          confirmButtonColor: '#E3180B',
        }).then(function () {
          partieFin();
        });
        
      } 

    } 
    else {
      updatePlateau(data.carte);

      if (data.tour === myturn) {

        actualturn = myturn;
        // C'est votre tour de jouer
        document.getElementById('player').innerText = joueur;

      } 
      
      else {
        actualturn = data.tour;
        // C'est le tour de l'adversaire
        document.getElementById('player').innerText = adversaire;
      }
    }
  }
   catch (error) {
    console.error("Erreur lors de la récupération du statut:", error);
  }

}

async function jouer(colonne, lignes) {
    
  try {
    console.log("colonne envoyé : "+colonne);
    const responseJouer = await fetch(`https://trankillprojets.fr/P4/?jouer&position=${colonne}&identifiant=${identifiant}`);
    const dataJouer = await responseJouer.json();

    // On décrémente la valeur de lignes[colonne] pour monter dans la ligne supérieur
    lignes[colonne]--;
  } catch (error) {
    console.error("Erreur lors de l'appel à jouer:", error);
  }
}

function updatePlateau(plateau) {
    
  for (let col = 0; col < 7; col++) {
    for (let row = 1; row <= 6; row++) {
      const caseId = 'c' + col + row;
      const caseElement = document.getElementById(caseId);
      const caseValue = plateau[row-1][col];

      if (caseValue === 1) {
        caseElement.classList.remove('animate__backInDown');

        caseElement.style.backgroundColor = player1color;
      } 
      
      else if (caseValue === 2) {
        caseElement.classList.remove('animate__backInDown');
        caseElement.style.backgroundColor = player2color;
      } 
      
      else {
        caseElement.style.backgroundColor = '';
      }
    }
  }
}
