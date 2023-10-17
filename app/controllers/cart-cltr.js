const Cart = require('../modals/cart-Modal');

const cartCltr = {};
const { validationResult } = require('express-validator')
cartCltr.add = async (req, res) => {
    try {
        const body = req.body;

        // Calculate the number of days between startDate and endDate
        const startDate = new Date(body.startDate);
        const endDate = new Date(body.endDate);
        const timeDifference = endDate - startDate;
        const days = Math.ceil(timeDifference / (1000 * 3600 * 24));

        // Calculate the price per day
        const pricePerDay = body.price;

        // Calculate the total price based on the number of days
        const totalPrice = days * pricePerDay;

        // Check if the item already exists in the cart for the current user
        const existingItem = await Cart.findOne({
            userId: req.user._id,
            productId: body.productId,
            workSpaceId: body.workSpaceId
        });

        if (existingItem) {
            // If it exists, increase the quantity using the $inc operator
            await Cart.updateOne(
                { userId: req.user._id, productId: body.productId },
                {
                    $push: { itemId: body.itemId },
                    $inc: { quantity: body.quantity },
                    $set: { price: existingItem.price + totalPrice } // Update the price
                }
            );
        } else {
            // If it doesn't exist, create a new cart item
            const cartItem = new Cart({
                userId: req.user._id,
                productId: body.productId,
                quantity: body.quantity,
                price: totalPrice, // Set the calculated price
                name: body.name,
                itemId: [body.itemId],
                workSpaceId: body.workSpaceId,
                startDate: body.startDate,
                endDate: body.endDate
            });
            await cartItem.save();
        }

        res.status(200).json({ message: 'Item added to cart successfully' });
    } catch (e) {
        // Handle errors
        console.error(e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

cartCltr.remove = async (req, res) => {
    try {
        const body = req.body;
        const userId = req.user._id;
        const productId = body.productId;

        // Find the cart item for the given user and product
        const cartItem = await Cart.findOne({ userId, productId });

        if (!cartItem) {
            // If the item doesn't exist, return an error response
            return res.status(404).json({ error: 'Item not found in the cart' });
        }

        if (cartItem.quantity > 1) {
            // If the quantity is greater than 1, decrement the quantity
            await Cart.updateOne(
                { userId, productId },
                { $inc: { quantity: -1 },$pull: { itemId: body.itemId } }
            );
        } else {
            // If the quantity is 1 or less, remove the document
            await Cart.deleteOne({ userId, productId });
        }

        res.status(200).json({ message: 'Item removed from cart successfully' });
    } catch (e) {
        // Handle errors
        console.error(e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


cartCltr.list = async (req, res) => {
    try {
        const cartitems = await Cart.find({userId:req.user._id}).populate('workSpaceId')

        res.json(cartitems)

    } catch (e) {
        // Handle errors
        console.error(e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

cartCltr.clear = async (req, res) => {
    try {
        const userId = req.user._id;
        await Cart.deleteMany({ userId });

        res.status(200).json({ message: 'Cart cleared successfully' })

    } catch (e) {
        // Handle errors
        console.error(e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

cartCltr.removeItem = async (req,res)=>{
    try{
        const id = req.params.id

        const deleteDoc = await Cart.findByIdAndDelete({_id:id})
        res.json(deleteDoc)

    }catch(e){


        res.json(e)


    }
}

module.exports = cartCltr;
