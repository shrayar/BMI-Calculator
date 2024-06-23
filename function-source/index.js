// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
    function calculateBMI(agent) {
    const height = agent.parameters.Height;
    const weight = agent.parameters.Weight;
    
    // Ensure height and weight are provided
    if (!height || !weight) {
        agent.add(`Please provide both height and weight.`);
        return;
    }

     const heightInCm = height * 30.48; // feet to cm

    // Convert weight from pounds to kilograms
    const weightInKg = weight * 0.453592; // pounds to kg

    // Calculate BMI
    const bmi = weightInKg / ((heightInCm / 100) * (heightInCm / 100));
    agent.add(`Your BMI is ${bmi.toFixed(2)}.`);

    
  }
    function interpretBMI(agent) {
    const bmi = agent.parameters.BMI;

    // Check if BMI is provided and is a valid number
    if (isNaN(bmi)) {
      agent.add(`The BMI is invalid`);
      return;
    }
	
    let bmiCategory = '';
    if (bmi < 18.5) {
      bmiCategory = 'underweight';
    } else if (bmi >= 18.5 && bmi < 24.9) {
      bmiCategory = 'normal weight';
    } else if (bmi >= 25 && bmi < 29.9) {
      bmiCategory = 'overweight';
    } else if (bmi >= 30 && bmi < 39.9) {
      bmiCategory = 'obese';
    } else {
      bmiCategory = 'severely obese';
    }

    let bmiRangeMessage = '';
    switch (bmiCategory) {
      case 'underweight':
        bmiRangeMessage = 'BMI less than 18.5 is considered underweight.';
        break;
      case 'normal weight':
        bmiRangeMessage = 'BMI between 18.5 and 24.9 is considered normal weight.';
        break;
      case 'overweight':
        bmiRangeMessage = 'BMI between 25 and 29.9 is considered overweight.';
        break;
      case 'obese':
        bmiRangeMessage = 'BMI between 30 and 39.9 is considered obese.';
        break;
      case 'severely obese':
        bmiRangeMessage = 'BMI 40 or greater is considered severely obese.';
        break;
      default:
        agent.add(`Unable to determine BMI ranges.`);
        return;
    }

    agent.add(`Your BMI falls into the category: ${bmiCategory}. ${bmiRangeMessage}`);
  }
  
   function bmiHealthTips(agent) {
    const bmiCategory = agent.parameters.BMIInterpretation;

    const healthTipsMap = {
      'underweight': "Here are some tips for gaining weight healthily if your BMI is underweight: 1. Eat more frequent, smaller meals. 2. Focus on nutrient-rich foods like nuts, seeds, avocados, and dairy products. 3. Incorporate strength training exercises to build muscle mass.",
      'normal': "To maintain a normal BMI, consider these health tips: 1. Eat a balanced diet with plenty of fruits, vegetables, lean proteins, and whole grains. 2. Stay physically active with regular exercise. 3. Get enough sleep and manage stress levels.",
      'overweight': "If your BMI is in the overweight range, try these health tips: 1. Focus on portion control and mindful eating. 2. Increase your physical activity with regular exercise, including cardio and strength training. 3. Seek support from a healthcare professional or registered dietitian.",
      'obese': "For managing weight with an obese BMI, consider these health tips: 1. Set realistic weight loss goals. 2. Focus on long-term lifestyle changes rather than short-term diets. 3. Seek support from a healthcare provider, dietitian, or weight loss support group.",
    };

    const healthTips = healthTipsMap[bmiCategory] || "I'm sorry, I don't have specific health tips for that BMI category.";
    agent.add(healthTips);
  }

  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/fulfillment-actions-library-nodejs
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('CalculateBMI', calculateBMI);
  intentMap.set('BMI Information', interpretBMI);
  intentMap.set('Health Tips Intent', bmiHealthTips);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
