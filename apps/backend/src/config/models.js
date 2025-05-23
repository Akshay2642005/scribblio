import * as handpose from '@tensorflow-models/handpose';

let model;

export const loadModel = async () => {
  model = await handpose.load();
  console.log('Model loaded');
};

export const predictGesture = async (video) => {
  if (!model) return null;
  const predictions = await model.estimateHands(video);
  if (predictions.length > 0) {
    const landmarks = predictions[0].landmarks;
    return landmarks;
  }
}

