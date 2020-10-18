import Location from 'react-app-location';
import * as Yup from 'yup';

export enum CreatePostTypes {
  request = 'request',
  offer = 'offer',
}

export const CreatePostLocation = new Location('/create/:createPostType', {
  type: Yup.string(),
});
export const CreateOfferLocation = new Location(
  `/create/post/${CreatePostTypes.offer.valueOf()}`,
);
export const CreateRequestLocation = new Location(
  `/create/post/${CreatePostTypes.request.valueOf()}`,
);
