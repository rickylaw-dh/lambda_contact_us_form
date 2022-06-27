// This is the reCaptcha secret key
const reCapUrl = 'https://www.google.com/recaptcha/api/siteverify';
const emailList = JSON.parse(process.env.MAILLIST);

const { SESv2Client, SendEmailCommand } = require("@aws-sdk/client-sesv2");
const axios = require("axios");

const concatContent = (eventBody) => {
  let contentData = "";
  for (var key in eventBody) {
    if (eventBody.hasOwnProperty(key) && eventBody[key] && key != "g-recaptcha-response") {
      contentData += `${key}: ${eventBody[key] ? eventBody[key] : ""}\n`;
    }
  }
  
  return contentData;
};

const getMailFromAndTo = (event) => {
  let requestOrigin =
    new URL(event.headers.origin).hostname.replace("www.", "") || "";

  let target = emailList.filter(
    (x) =>
      x.domain == requestOrigin ||
      requestOrigin.includes(x.domain) ||
      x.domain.includes(requestOrigin)
  );
  return target[0];
};

exports.handler = async (event) => {
  // Enable to inspect the params in Amazon Cloudwatch
  console.log(event);

  // will show sth like "test-site-ses.s3-website-ap-northeast-1.amazonaws.com"
  let target = getMailFromAndTo(event);

  if (target === undefined) {
    const response = {
      statusCode: 200,
      body: JSON.stringify({ error: "Mail target not found." }),
    };
    console.log(response);
    return response;
  }

  const { sitename, captchaKey, mailfrom, mailto } = target;

  let eventBody = event.body;

  // // verify the result by POSTing to google backend with secret and
  // // frontend recaptcha token as payload
  let verifyResult = await axios({
    method: "post",
    url: reCapUrl,
    params: {
      secret: captchaKey,
      response: eventBody["g-recaptcha-response"],
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "*/*",
    },
  });

  // // Enable to see the result in CloudWatch
  console.log(verifyResult);

  if (verifyResult.status !== 200) {
    const response = {
      statusCode: verifyResult.status,
      body: JSON.stringify({ error: verifyResult.data["error-codes"] }),
    };
    console.log(response);
    return response;
  }

  // if verify failed
  if (verifyResult.data["success"] !== true) {
    const response = {
      statusCode: verifyResult.status,
      body: JSON.stringify({ error: verifyResult.data["error-codes"] }),
    };
    console.log(response);
    return response;
  }

  let contentData = concatContent(eventBody);
  const emailParams = {
    FromEmailAddress: mailfrom,
    Destination: {
      ToAddresses: mailto,
    },
    //ReplyToAddresses: [eventBody.contactemail ? eventBody.contactemail : ""],
    Content: {
      Simple: {
        Subject: {
          Charset: "UTF-8",
          Data: `${sitename}`,
        },
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: contentData,
          },
        },
      },
    },
  };

  try {
    const ses = new SESv2Client();
    const data = await ses.send(new SendEmailCommand(emailParams));

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: `Email processed successfully!`,
      }),
    };
    console.log(response);
    return response;
  } catch (e) {
    const response = {
      statusCode: 500,
      body: JSON.stringify({ error: e.errorMessage }),
    };
    console.log(response);
    return response;
  }
};
