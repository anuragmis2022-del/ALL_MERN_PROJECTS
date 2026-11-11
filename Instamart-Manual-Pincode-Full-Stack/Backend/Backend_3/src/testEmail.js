require("dotenv").config();

const sendEmail = require("./Utils/sendEmail");

const testEmail = async () => {
  const result = await sendEmail(
    "Quick Commerce Stock Watcher - Test Email",
    "Congratulations! Your email notification system is working successfully."
  );

  if (result.success) {
    console.log("Test email delivered successfully.");
  } else {
    console.log("Test email failed:", result.message);
  }
};

testEmail();