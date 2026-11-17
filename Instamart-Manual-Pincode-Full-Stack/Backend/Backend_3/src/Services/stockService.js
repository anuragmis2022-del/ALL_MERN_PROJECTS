
const StockHistory = require("../Model/StockHistory");
const sendEmail = require("../Utils/sendEmail");

// TRACK STOCK STATUS CHANGES
const trackStockStatusChange = async (product, newStatus) => {
  try {
    // STEP 1: Get previous stock status
    const previousStatus = product.stockStatus;

    // Allowed stock statuses
    const validStatuses = [
      "In Stock",
      "Out of Stock",
      "Unknown",
    ];

    // STEP 2: Validate new stock status
    if (!validStatuses.includes(newStatus)) {
      console.log("Invalid stock status:", newStatus);
      return;
    }

    // STEP 3: Ignore Unknown or first-time stock status
    if (
      !validStatuses.includes(previousStatus) ||
      previousStatus === "Unknown" ||
      newStatus === "Unknown"
    ) {
      return;
    }

    // STEP 4: Check whether stock actually changed
    if (previousStatus === newStatus) {
      return;
    }

    // STEP 5: Save stock history in MongoDB
    await StockHistory.create({
      productId: product._id,
      previousStatus,
      newStatus,
      changedAt: new Date(),
    });

    console.log(
      `Stock status changed: ${previousStatus} -> ${newStatus}`
    );

    // STEP 6: Send email only when product comes back in stock
    if (
      previousStatus === "Out of Stock" &&
      newStatus === "In Stock"
    ) {
      const emailMessage = `
Hello,

Good news! Your tracked Instamart product is available again.

Product: ${product.productName}
Previous Stock Status: ${previousStatus}
Current Stock Status: ${newStatus}
PIN code: ${product.pincode}
Product Link: ${product.productUrl}
Updated At: ${new Date().toLocaleString()}

Quick Commerce Stock Watcher
`;

      try {
        const emailResult = await sendEmail(
          `Back in Stock: ${product.productName}`,
          emailMessage
        );

        if (!emailResult?.success) {
          console.log(
            "Back-in-stock email failed:",
            emailResult?.message || "Unknown email error"
          );
        } else {
          console.log(
            "Back-in-stock email sent successfully."
          );
        }
      } catch (emailError) {
        // Email failure should not affect stock history
        console.error(
          "Back-in-stock email error:",
          emailError.message
        );
      }
    }

  } catch (error) {
    // Stock history failure should not stop price monitoring
    console.error(
      "Stock history error:",
      error.message
    );
  }
};

module.exports = {
  trackStockStatusChange,
};
