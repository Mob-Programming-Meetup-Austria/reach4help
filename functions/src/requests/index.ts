import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Change, EventContext } from 'firebase-functions/lib/cloud-functions';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';

import { IUser } from '../users';
import GeoPoint = admin.firestore.DocumentReference;

export enum RequestStatus {
  pending = 'pending',
  ongoing = 'ongoing',
  completed = 'completed',
  cancelled = 'cancelled',
  removed = 'removed'
}

export interface IRequest extends FirebaseFirestore.DocumentData {
  cavUserRef: FirebaseFirestore.DocumentReference<IUser> | null;
  pinUserRef: FirebaseFirestore.DocumentReference<IUser> | null;
  title: string;
  description: string;
  latLng: GeoPoint;
  status: RequestStatus;
  rating: number | null;
}

export class Request implements IRequest {
  private _cavUserRef: FirebaseFirestore.DocumentReference<IUser> | null;
  private _pinUserRef: FirebaseFirestore.DocumentReference<IUser> | null;
  private _title: string;
  private _description: string;
  private _latLng: GeoPoint;
  private _status: RequestStatus;
  private _rating: number | null;

  constructor(
    cavUserRef: FirebaseFirestore.DocumentReference<IUser> | null,
    pinUserRef: FirebaseFirestore.DocumentReference<IUser> | null,
    title: string,
    description: string,
    latLng: GeoPoint,
    status: RequestStatus,
    rating: number | null = null,
  ) {
    this._cavUserRef = cavUserRef;
    this._pinUserRef = pinUserRef;
    this._title = title;
    this._description = description;
    this._latLng = latLng;
    this._status = status;
    this._rating = rating;
  }

  static factory = (data: IRequest): Request => new Request(
    data.cavUserRef,
    data.pinUserRef,
    data.title,
    data.description,
    data.latLng,
    data.status,
  );

  get cavUserRef(): FirebaseFirestore.DocumentReference<IUser> | null {
    return this._cavUserRef;
  }

  set cavUserRef(value: FirebaseFirestore.DocumentReference<IUser> | null) {
    this._cavUserRef = value;
  }

  get pinUserRef(): FirebaseFirestore.DocumentReference<IUser> | null {
    return this._pinUserRef;
  }

  set pinUserRef(value: FirebaseFirestore.DocumentReference<IUser> | null) {
    this._pinUserRef = value;
  }

  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
  }

  get latLng(): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
    return this._latLng;
  }

  set latLng(value: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>) {
    this._latLng = value;
  }

  get status(): RequestStatus {
    return this._status;
  }

  set status(value: RequestStatus) {
    this._status = value;
  }

  get rating(): number | null {
    return this._rating;
  }

  set rating(value: number | null) {
    this._rating = value;
  }
}

// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
const queueStatusUpdateTriggers = (change: Change<DocumentSnapshot>, context: EventContext): Promise<void[]> => {
  const requestBefore = change.before ? change.before.data() as Request : null;
  const requestAfter = change.after.data() ? change.after.data() as Request : null;

  const operations: Promise<void>[] = [];

  // A request has just been completed - Update CAV request completed count
  if (requestBefore && requestBefore.status !== RequestStatus.completed && requestAfter && requestAfter.status === RequestStatus.completed) {
    // TODO: Update CAV User Ref count for number of cases completed.
    operations.push(Promise.resolve());
  }

  // We have a new record -  Update PIN requests made count
  if (requestBefore === null) {
    // TODO: Update the PIN User Ref count for how many times they have requested help
    operations.push(Promise.resolve());
  }

  return Promise.all(operations);
};

// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
const queueRatingUpdatedTriggers = (change: Change<DocumentSnapshot>, context: EventContext): Promise<void[]> => {
  const requestBefore = change.before ? change.before.data() as Request : null;
  const requestAfter = change.after.data() ? change.after.data() as Request : null;

  const operations: Promise<void>[] = [];

  // We have a new rating -  Update CAV rating average but only this time.
  if (requestBefore && requestAfter && requestBefore.rating === null && requestAfter.rating !== null) {
    // TODO: Adjust the avg rating based on the new rating
    operations.push(Promise.resolve());
  } else if (requestBefore && requestAfter && requestBefore.rating !== null && requestAfter.rating !== null) {
    // TODO: Adjust the avg rating based on the old rating and the new rating
    operations.push(Promise.resolve());
  }

  return Promise.all(operations);
};

export const triggerEventsWhenRequestIsUpdated = functions.firestore.document('requests/{requestId}')
  .onUpdate((change: Change<DocumentSnapshot>, context: EventContext) => Promise.all([
    queueStatusUpdateTriggers(change, context),
    queueRatingUpdatedTriggers(change, context),
  ]));
