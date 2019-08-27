class RedeNaural{
  constructor(a, b, c, d){
    if(a instanceof tf.Sequential){
      this.model = a;
      this.input_nodes = b;
      this.hidden_nodes = c;
      this.output_nodes = d;
    }else{
      this.input_nodes = a;
      this.hidden_nodes = b;
      this.output_nodes = c;
      this.model = this.createModel();
    }
    this.result = null;
    this.dispose = false;
  }
  copy(){
    return tf.tidy(() => {
      const modelCopy = this.createModel();
      const weights = this.model.getWeights();
      const weightCopies = [];
      for (let i=0; i<weights.length; i++){
        weightCopies[i] = weights[i].clone();
      }
      modelCopy.setWeights(weightCopies);
      return new RedeNaural(
          modelCopy,
          this.input_nodes,
          this.hidden_nodes,
        this.output_nodes);
    });
  }
  mutate(rate){
    tf.tidy(() => {
      const weights = this.model.getWeights();
      const mutatedWeights = [];
      for(let i=0; i<weights.length; i++){
        let tensor = weights[i];
        let shape = weights[i].shape;
        let values = tensor.dataSync().slice();
        for(let j=0; j<values.length; j++){
          if(random(1)<rate){
            let w = values[j];
            values[j] = w + randomGaussian();
          }
        }
        let newTensor = tf.tensor(values, shape);
        mutatedWeights[i] = newTensor;
      }
      this.model.setWeights(mutatedWeights);
    });
  }
  dispose(){
    this.result = null;
    this.model.dispose();
  }
  predict(inputs){
    return tf.tidy(() => {
      const xs = tf.tensor2d([inputs]);
      const ys = this.model.predict(xs);
      const outputs = ys.dataSync();
      // const proximity = tf.metrics.binaryAccuracy (ys, outputs);
      // proximity.print();
      let yOut = [];
      for(let i in outputs){
        yOut.push(outputs[i]);
      }
      this.model.compile({optimizer: 'sgd', loss: 'categoricalCrossentropy'});
      this.result = this.model.evaluate(xs, tf.tensor2d([yOut]), {batchSize: 4});

      return outputs;
    })
  }
  createModel(){
    const model = tf.sequential();
    const hidden = tf.layers.dense({
      units: this.hidden_nodes,
      inputShape: [this.input_nodes],
      activation: 'sigmoid'
    });
    model.add(hidden);
    const output = tf.layers.dense({
      units: this.output_nodes,
      activation: 'sigmoid'
    });
    model.add(output);
    return model;
  }
  getAcc(inputs){
    return tf.tidy(() => {
      const xs = tf.tensor2d([inputs]);
      const ys = this.model.predict(xs);
      const outputs = ys.dataSync();
      // const proximity = tf.metrics.binaryAccuracy (ys, outputs);
      // proximity.print();
      let yOut = [];
      for(let i in outputs){
        yOut.push(outputs[i]);
      }
      this.model.compile({optimizer: 'sgd', loss: 'categoricalCrossentropy'});
      const result = this.model.evaluate(xs, tf.tensor2d([yOut]), {batchSize: 4});

      return result.print();
    })
  }
  save(){
    const saveResults = this.model.save('downloads://my-model-1');
  }
}
