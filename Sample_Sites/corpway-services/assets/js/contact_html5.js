let apiUrl = "https://n4q089b0u0.execute-api.ap-southeast-1.amazonaws.com/Prod";

$("form").submit(function (event) {
  //console.log("form submitted.");

  if (!grecaptcha.getResponse()) {
    //console.log("captcha not yet completed.");

    event.preventDefault(); //prevent form submit
    grecaptcha.execute();
  } else {
    //console.log("form really submitted.");
  }
});

onCompleted = function () {
  var formData = Object.fromEntries(
    new FormData(document.querySelector("form")).entries()
  );
  let finalFormData = Object.assign(formData, {
    "g-recaptcha-response": grecaptcha.getResponse(),
  });

  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalFormData),
  })
    .then((res) => res.json())
    .then((res) => {
      try {
        showThankYou();
      } catch (error) {}
      //console.log(res); // {"message":"Email processed succesfully!"};
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

function showThankYou(){
    alert('Thank you!');
};