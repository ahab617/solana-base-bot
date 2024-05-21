import { Alerts } from "model";

const create = async (data: { hash: string; groupId: string }) => {
  const newData = new Alerts(data);
  const saveData = await newData.save();
  if (!saveData) {
    throw new Error("Database Error");
  }
  return true;
};

const find = async (props: any) => {
  const { filter } = props;
  const result = await Alerts.find(filter);
  return result;
};

const findOne = async (props: any) => {
  const { filter } = props;
  const result = await Alerts.findOne(filter);
  return result;
};

const update = async (props: any) => {
  const { filter, update } = props;
  const result = await Alerts.findOneAndUpdate(filter, update);
  return result;
};

const deleteMany = async (props: any) => {
  const { filter } = props;
  const result = await Alerts.deleteMany(filter);
  return result;
};

const deleteOne = async (props: any) => {
  const { filter } = props;
  const result = await Alerts.deleteOne(filter);
  return result;
};

export default {
  create,
  find,
  update,
  deleteMany,
  deleteOne,
  findOne,
};
