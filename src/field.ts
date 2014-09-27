interface StaticAttractor {
  position: IntegerVector;
  mass: number;
}

var X_POS_MAX = 2600;
var Y_POS_MAX = 1000;
var FIELD_RESOLUTION = 10;

var X_GRAVITY_MAX = X_POS_MAX / FIELD_RESOLUTION;
var Y_GRAVITY_MAX = Y_POS_MAX / FIELD_RESOLUTION;
var FIELD_ARRAY_SIZE = X_GRAVITY_MAX * Y_GRAVITY_MAX;
var GRAVITATIONAL_CONSTANT = 1000;

var EDGE_REPULSOR_STRENGTH = 1000;
var EDGE_REPULSOR_DIST = 10;

var pixel2fieldX = (x) => x;
var pixel2fieldY = (x) => x;

/**
 * Model the field of gravity generated by a set of StaticAttractores.
 * A gravity field is immutable. A new gravity field can be created by
 * adding an additional StaticAttractor
 */
class GravityField {
  private xField: Int16Array;
  private yField: Int16Array;
  constructor(xField: Int16Array, yField: Int16Array, attractor?: StaticAttractor) {
    this.xField = new Int16Array(FIELD_ARRAY_SIZE);
    this.yField = new Int16Array(FIELD_ARRAY_SIZE);
    if (!attractor) {
      for (var i=0; i<FIELD_ARRAY_SIZE; i++) {
        this.xField[i] = xField[i];
        this.yField[i] = yField[i];
      }
    } else {
      var attractorXPosition = pixel2fieldX(attractor.position.x());
      var i = 0;
      for (var x=0; x<X_GRAVITY_MAX; x++) {
        var g = GravityField.computeFieldContribution(x, attractorXPosition, attractor.mass);
        for (var y=0; y<Y_GRAVITY_MAX; y++) {
          this.xField[i] = xField[i] + g;
          i++;
        }
      }
      if (i != FIELD_ARRAY_SIZE) {
        throw new Error("something really bad happened: x");
      }
      var i = 0;
      var attractorYPosition = pixel2fieldY(attractor.position.y());
      for (var y=0; y<Y_GRAVITY_MAX; y++) {
        var g = GravityField.computeFieldContribution(y, attractorYPosition, attractor.mass);
        for (var x=0; x<X_GRAVITY_MAX; x++) {
          this.yField[i] = yField[i] + g;
          i++;
        }
      }
      if (i != FIELD_ARRAY_SIZE) {
        throw new Error("something really bad happened: y");
      }
    }
  }

  public addAttractor(attractor: StaticAttractor): GravityField {
    return new GravityField(this.xField, this.yField, attractor);
  }

  public static computeFieldContribution(position, source, mass) {
    var direction = position < source ? 1 : -1;
    var distSq = (position - source) * (position - source);
    var g = distSq != 0 ? (GRAVITATIONAL_CONSTANT * mass / distSq) | 0 : 0;
    return g;
  }
}

var initialField = function() {
  var xField = new Int16Array(FIELD_ARRAY_SIZE);
  var yField = new Int16Array(FIELD_ARRAY_SIZE);
  for (var x=0; x<EDGE_REPULSOR_DIST; x++) {
    var strength = EDGE_REPULSOR_STRENGTH * (EDGE_REPULSOR_DIST - x);
    for (var y=0; y<Y_GRAVITY_MAX; y++) {
      xField[x * X_GRAVITY_MAX + y] = strength;
      xField[(X_GRAVITY_MAX - x) * X_GRAVITY_MAX + y] = -strength;
    }
  }
  for (var y=0; y<EDGE_REPULSOR_DIST; y++) {
    var strength = EDGE_REPULSOR_STRENGTH * (EDGE_REPULSOR_DIST - y);
    for (var x=0; x<X_GRAVITY_MAX; x++) {
      yField[y * Y_GRAVITY_MAX + x] = strength;
      yField[(Y_GRAVITY_MAX - y) * Y_GRAVITY_MAX + x] = -strength;
    }
  }
  return new GravityField(xField, yField);
}();