export type Json = string | number | boolean | null | { [property: string]: Json } | Json[];

export type ApiState<T extends Json = Json> = {
  hash: string | undefined;
  data: T | undefined;
};

export type PollingResultState = {
  hash: string;
  rawData: ArrayBuffer;
};

export type StateSetterType = (state: ApiState) => void;
export type PollingResultSetterType = (state: PollingResultState | undefined) => void;

export type DestructorType = () => void;
export type CollectionRecordType = { id: string | number; [prop: string]: Json };
export type MappedCollectionType<T extends CollectionRecordType> = Map<T['id'], T>;
