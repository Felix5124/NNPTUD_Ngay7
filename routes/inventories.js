var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let inventoryModel = require('../schemas/inventories');

router.get('/', async function (req, res) {
    let data = await inventoryModel.find({}).populate('product');
    res.send(data);
});

router.get('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let result = await inventoryModel.findById(id).populate('product');
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({
                message: 'ID NOT FOUND'
            });
        }
    } catch (error) {
        res.status(404).send({
            message: error.message
        });
    }
});

router.post('/add-stock', async function (req, res) {
    try {
        let product = req.body.product;
        let quantity = Number(req.body.quantity);

        if (!mongoose.Types.ObjectId.isValid(product)) {
            return res.status(400).send({ message: 'Invalid product id' });
        }

        if (!Number.isFinite(quantity) || quantity <= 0) {
            return res.status(400).send({ message: 'quantity must be > 0' });
        }

        let result = await inventoryModel.findOneAndUpdate(
            { product: product },
            {
                $setOnInsert: {
                    product: product
                },
                $inc: {
                    stock: quantity
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        ).populate('product');

        res.send(result);
    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
});

router.post('/remove-stock', async function (req, res) {
    try {
        let product = req.body.product;
        let quantity = Number(req.body.quantity);

        if (!mongoose.Types.ObjectId.isValid(product)) {
            return res.status(400).send({ message: 'Invalid product id' });
        }

        if (!Number.isFinite(quantity) || quantity <= 0) {
            return res.status(400).send({ message: 'quantity must be > 0' });
        }

        let result = await inventoryModel.findOneAndUpdate(
            {
                product: product,
                stock: { $gte: quantity }
            },
            {
                $inc: {
                    stock: -quantity
                }
            },
            {
                new: true,
                runValidators: true
            }
        ).populate('product');

        if (!result) {
            return res.status(400).send({
                message: 'Insufficient stock or inventory not found'
            });
        }

        res.send(result);
    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
});

router.post('/reservation', async function (req, res) {
    try {
        let product = req.body.product;
        let quantity = Number(req.body.quantity);

        if (!mongoose.Types.ObjectId.isValid(product)) {
            return res.status(400).send({ message: 'Invalid product id' });
        }

        if (!Number.isFinite(quantity) || quantity <= 0) {
            return res.status(400).send({ message: 'quantity must be > 0' });
        }

        let result = await inventoryModel.findOneAndUpdate(
            {
                product: product,
                stock: { $gte: quantity }
            },
            {
                $inc: {
                    stock: -quantity,
                    reserved: quantity
                }
            },
            {
                new: true,
                runValidators: true
            }
        ).populate('product');

        if (!result) {
            return res.status(400).send({
                message: 'Insufficient stock or inventory not found'
            });
        }

        res.send(result);
    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
});

router.post('/sold', async function (req, res) {
    try {
        let product = req.body.product;
        let quantity = Number(req.body.quantity);

        if (!mongoose.Types.ObjectId.isValid(product)) {
            return res.status(400).send({ message: 'Invalid product id' });
        }

        if (!Number.isFinite(quantity) || quantity <= 0) {
            return res.status(400).send({ message: 'quantity must be > 0' });
        }

        let result = await inventoryModel.findOneAndUpdate(
            {
                product: product,
                reserved: { $gte: quantity }
            },
            {
                $inc: {
                    reserved: -quantity,
                    soldCount: quantity
                }
            },
            {
                new: true,
                runValidators: true
            }
        ).populate('product');

        if (!result) {
            return res.status(400).send({
                message: 'Insufficient reserved quantity or inventory not found'
            });
        }

        res.send(result);
    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
});

module.exports = router;
