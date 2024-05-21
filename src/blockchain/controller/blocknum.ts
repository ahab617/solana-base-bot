import { BLOCKNUM } from "../model/blocknum";

export const BlockNumController = {
  create: async ({ id, latestTime }: any) => {
    const updateData = { id, latestTime };
    var oldData = await BLOCKNUM.findOne({ id: id });
    if (!oldData) {
      const newData = new BLOCKNUM({
        id: id,
        latestTime: latestTime,
      });
      await newData.save();
      return true;
    } else {
      await BLOCKNUM.updateOne({ id: id }, { $set: updateData });
      return false;
    }
  },
  findOne: async ({ id }: any) => {
    return await BLOCKNUM.findOne({ id: id });
  },
  find: async ({ id }: any) => {
    return await BLOCKNUM.find({ id: id });
  },
  update: async (filter: any, newData: any) => {
    return await BLOCKNUM.updateOne(filter, { $set: newData });
  },
  deleteOne: async (props: any) => {
    const { filter } = props;
    const result = await BLOCKNUM.deleteOne(filter);
    return result;
  },
};
