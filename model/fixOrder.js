const mongoose = require('mongoose');

const fixOrderSchema = new mongoose.Schema({
  sender: { type: String, required: true, unique: true },
  helper: { type: String, require: true, default: '' },
  comment: { type: String, require: true, default: '' },
  address: { type: String, require: true, default: '' },
  status: { type: String, require: true, default: 'normal' },
  timestamp: { type: Date, default: Date.now, require: true },
});

// Define a model for the FixOrder collection using the schema
const FixOrderTable = mongoose.model('FixOrder', fixOrderSchema);

class FixOrder {
    static async createFixOrder(sender, comment, address, status){
        let res = await FixOrderTable.find({ sender });
        if(res.length <= 0){
            return FixOrderTable.create({ sender, comment, address, status });
        }
        else{
            const helper = '';
            return FixOrderTable.updateOne({ sender }, { $set: { comment, address, status, helper } });
        } 
    }

    static async getFixOrderStatus(sender) {
        const status = await FixOrderTable.find({ sender }).sort({ timestamp: -1 }).limit(1);
        return status.length > 0 ? status[0].status : 'normal';
    }
    
    static async updateFixOrderByElectrian(sender, helper, status){
        let res = await FixOrderTable.find({ sender }).sort({ timestamp: -1 }).limit(1);
        res.helper = helper;
        res.status = status;
        return FixOrderTable.updateOne({ sender }, { $set: { status: status, helper: helper} });
    }

    static async getUnfixOrders(){
        return await FixOrderTable.find({status: {$in: ['needFix', 'fixing']}}).sort({ timestamp: -1});
        
        // const latestOrders = await FixOrderTable.aggregate([
        //     // Group by sender and get the latest timestamp for each sender
        //     { $group: {
        //         _id: "$sender",
        //         latestTimestamp: { $max: "$timestamp" }
        //     }},
        //     // Join with original collection to get the full document
        //     { $lookup: {
        //         from: "fixorders",
        //         localField: "_id",
        //         foreignField: "sender",
        //         as: "fixOrder"
        //     }},
        //     // Unwind the fixOrder array
        //     { $unwind: "$fixOrder" },
        //     // Match only the documents with status "needFix"
        //     { $match: { "fixOrder.status": "needFix" }}
        // ]);
        // return latestOrders;
    }
}

module.exports = FixOrder;