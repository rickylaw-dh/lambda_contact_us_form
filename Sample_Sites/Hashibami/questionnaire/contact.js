let apiUrl = "https://ehjm0i2jb7.execute-api.ap-northeast-1.amazonaws.com/stag";

function onSubmit(token) {
  let hasError = checkReq();

  if (hasError) return;

  var formData = Object.fromEntries(
    new FormData(document.querySelector("form")).entries()
  );
  let finalFormData = Object.assign(formData, {
    "g-recaptcha-response": token,
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
}

function checkReq() {
  let hasError = false;
  $("select[required]").each(function (e) {
    if ($(this).val() == "") {
      hasError = true;
      $(this).closest(".form-row").find("h5").show();
    } else {
      $(this).closest(".form-row").find("h5").hide();
    }
  });
  return hasError;
}

function showThankYou() {
  $(".heades p").each(function (e) {
    $(this).remove();
  });
  $("form").remove();

  let thankYou =
    "<p>Thank you and look forward to seeing you again in Hashibami!</p><p>謝謝！期待再次光臨 榛 Hashibami！</p>";
  $(".heades").addClass("finish").append(thankYou);
}
