var inquirer = require("inquirer");
var deck = require("./carddeck.json");
var BasicCard = require("./BasicCard.js")
var ClozeCard = require("./ClozeCard.js")
const fs = require("fs");

var selectedCard;
var playedCard;
var count = 0;

 
function menu() {
  inquirer.prompt([															 
      {
          type: "list",														 
          message: "\nPlease choose a menu option from the list below?",	 
          choices: ["Create", "Display Deck", "Pick Card", "Flash Quiz", "Exit"],	 
          name: "Options"												 
      }
  ]).then(function (answer) {												 
    var command;

    switch (answer.Options) {

        case 'Create':
            console.log("Create flash card...");
            createCard();
            break;
        case 'Display Deck':
            console.log("Display Flash cards to your screen...");
            displayDeck();
            break; 
        case 'Pick Card':
            console.log("Pick Card from the deck");
            pickCard();
            break; 
        case 'Flash Quiz':
            console.log("Pick Card from the deck");
            askQuestions();
            break;        
        case 'Exit':
            console.log("");
            console.log("Sorry to see you go!; Visit soon. BYE!")
            console.log("");
            return;
            break;
        default:
            console.log("");
            console.log("Invalid selection: Try again");
            console.log("");


            
    }

  });

}

menu();

 
function createCard() {
    inquirer.prompt([
        {
            name: "cardType",
            type: "list",
            message: "Select type of Flash Card to create?",
            choices: ["Basic Card", "Cloze Card"]
        }

    ]).then(function (cInput) {
        var cardType = cInput.cardType;  			
        console.log(cardType);			  			

        if (cardType === "Basic Card") {
            inquirer.prompt([
                {
                    name: "front",
                    type: "input",
                    message: "Please fill out the front of your card (Your Question)."
                },
                {
                    name: "back",
                    type: "input",
                    message: "Please fill out the back of your card (Your Answer)."
                }
            ]).then(function (bCardData) {
                var cardObj = {						
                    type: "BasicCard",
                    front: bCardData.front,
                    back: bCardData.back
                };
                deck.push(cardObj);				
                fs.writeFile("carddeck.json", JSON.stringify(deck, null, 2),  (err) => {if (err) throw err;}); 
                inquirer.prompt([					
                    {
                        name: "anotherCard",
                        type: "list",
                        message: "Do you want to create another card?",
                        choices: ["Yes", "No"]
                    }
                ]).then(function (cInput) {				
                    if (cInput.anotherCard === "Yes") {	
                        createCard();						
                    } else {								
                            menu();			
                    }
                });
            });

        } else {						
            inquirer.prompt([
                {
                    type: "input",
                    message: "Please type out the full text of your statement (remove cloze in next step).",
                    name: "text"
                },
                {
                    type: "input",
                    message: "Please type the portion of text you want to cloze",
                    name: "cloze"
                }
            ]).then(function (cCardData) {            
                var partialCloze = cCardData.text.replace(cCardData.cloze, '...') 
                var cardObj = {						
                    type: "ClozeCard",
                    text: cCardData.text,
                    cloze: cCardData.cloze,
                    partial: partialCloze
                };
                if (cardObj.text.indexOf(cardObj.cloze) !== -1) {    
                    deck.push(cardObj);							 
                    fs.writeFile("carddeck.json", JSON.stringify(deck, null, 2),  (err) => {if (err) throw err;}); 
                } else {											 
                    console.log("Sorry, The cloze must match some word(s) in the text of your statement.");

                }
                inquirer.prompt([					 
                    {
                        type: "list",
                        message: "Do you want to create another card?",
                        choices: ["Yes", "No"],
                        name: "anotherCard"
                    }

                ]).then(function (cInput) {				 
                    if (cInput.anotherCard === "Yes") {	 
                        createCard();						 
                    } else {								 
                        menu();		 
                    }
                });
            });
        }

    });
};

 
function pickQuestions(card) {
    if (card.type === "BasicCard") {						 
        selectedCard = new BasicCard(card.front, card.back);	 
        return selectedCard.front;								 
    } else if (card.type === "ClozeCard") {					 
        selectedCard = new ClozeCard(card.text, card.cloze)	 
        return selectedCard.clozeRemoved();					 
    }
};

//function to ask questions from all stored card in the deck
function askQuestions() {
    if (count < deck.length) {					 
        playedCard = pickQuestions(deck[count]);	 
        inquirer.prompt([							 
            {
                type: "input",
                message: playedCard,inquirer,
                name: "question"
            }
        ]).then(function (answer) {					 
        	//if the users answer equals .back or .cloze of the playedCard run a message "You are correct."
            if (answer.question === deck[count].back || answer.question === deck[count].cloze) {
                console.log("You are correct.");
            } else {
            	//check to see if current card is Cloze or Basic
                if (selectedCard.front !== undefined) {  
                    console.log("Sorry, the correct answer was " + deck[count].back + ".");  
                } else { // otherwise it is a Cloze car
                    console.log("Sorry, the correct answer was " + deck[count].cloze + "."); 
                }
            }
            count++; 		 
            askQuestions(); 
        });
    } else {
      	count=0;			 
      	menu();			 
    }
};


//function to ask question from a random card
function pickCard() {
  var randomNumber = Math.floor(Math.random() * (deck.length - 1));   

  playedCard = pickQuestions(deck[randomNumber]);	 
        inquirer.prompt([							 
            {
                type: "input",
                message: playedCard,
                name: "question"
            }
        ]).then(function (answer) {					 
        	 
            if (answer.question === deck[randomNumber].back || answer.question === deck[randomNumber].cloze) {
                console.log("You are correct.");
                menu();
            } else {
            	 
                if (selectedCard.front !== undefined) { 
                    console.log("Sorry, the correct answer was " + deck[randomNumber].back + ".");  
                    menu();
                } else {  
                    console.log("Sorry, the correct answer was " + deck[randomNumber].cloze + "."); 
                    menu();
                }
            }
        });

};

//DisplY all cards on screen 
function displayDeck () {

  var deck = require("./cardDeck.json");

  if (count < deck.length) {                     
    

    if (deck[count].front !== undefined) {  
        console.log("");
        console.log("Basic Card");
        console.log("----------");
        console.log("Card Front: " + deck[count].front); 
        console.log("");
        console.log("Card Back: " + deck[count].back + "."); 
        console.log(" ");
        console.log("-----------------------------------------------------------------------------------------------------");
        console.log("");

    } else {  
        console.log("");
        console.log("Cloze Card");
        console.log("----------");
        console.log("Text: " + deck[count].text);  
        console.log("");
        console.log("Cloze: " + deck[count].cloze + "."); 
        console.log(""); 
        console.log("partial: " + deck[count].partial + ".");  
        console.log("-----------------------------------------------------------------------------------------------------");
        console.log("");
    }
    count++;		 
    displayDeck();	 
  } else {
    count=0;		 
    menu();		 
  }
};
