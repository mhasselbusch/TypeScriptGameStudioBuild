/// <reference path="./BaseActor.ts"/>

/**
* A Route specifies a set of points that an actor will move between at a fixed speed.
*/
class Route {
  /// The X coordinates of the points in the route
  mXIndices: Array<number>;
  /// The Y coordinates of the points in the route
  mYIndices: Array<number>;
  /// The current number of points that have been set
  mPoints: number;

  /**
  * Define a new path by specifying the number of points in the path.  The points in the path
  * will be uninitialized until the "to" method is called on this Route.
  *
  * @param numberOfPoints number of points in the path.  There should be at least two points
  */
  constructor(numberOfPoints: number) {
    this.mPoints = 0;
    this.mXIndices = new Array<number>();
    this.mYIndices = new Array<number>();
  }

  /**
  * Add a new point to a path by giving (coordinates for where the center of the actor goes next
  *
  * @param x X value of the new coordinate
  * @param y Y value of the new coordinate
  */
  public to(x: number, y: number): Route {
    this.mXIndices[this.mPoints] = x;
    this.mYIndices[this.mPoints] = y;
    this.mPoints++;
    return this;
  }
}


namespace Route {
  /**
  * Driver is an internal class, used by LOL to determine placement for a WorldActor whose motion
  * is controlled by a Route.
  */
  export class Driver {
    /// The route that is being applied
    private readonly mRoute: Route;
    /// The actor to which the route is being applied
    private readonly mActor: BaseActor;
    /// The speed at which the actor moves along the route
    private readonly mRouteVelocity: number;
    /// When the actor reaches the end of the route, should it start again?
    private readonly mRouteLoop: boolean;
    /// A temp for computing positions
    private mRouteVec: PhysicsType2d.Vector2
    /// Is the route still running?
    private mRouteDone: boolean;
    /// Index of the next point in the route
    private mNextRouteGoal: number;

    /**
    * Constructing a route driver also starts the route
    *
    * @param route    The route to apply
    * @param velocity The speed at which the actor moves
    * @param loop     Should the route repeat when it completes?
    * @param actor    The actor to which the route should be applied
    */
    constructor(route: Route, velocity: number, loop: boolean, actor: BaseActor) {
      this.mRoute = route;
      this.mRouteVelocity = velocity;
      this.mRouteLoop = loop;
      this.mActor = actor;
      this.mRouteVec = new PhysicsType2d.Vector2(0, 0);
      // kick off the route, indicate that we aren't all done yet
      this.startRoute();
      this.mRouteDone = false;
    }

    /**
    * Stop a route, and stop the actor too
    */
    haltRoute(): void {
      this.mRouteDone = true;
      this.mActor.setAbsoluteVelocity(0, 0);
    }

    /**
    * Begin running a route
    */
    private startRoute(): void {
      // move to the starting point
      this.mActor.mBody.SetTransform(new PhysicsType2d.Vector2(this.mRoute.mXIndices[0] + this.mActor.mSize.x / 2,
      this.mRoute.mYIndices[0] + this.mActor.mSize.y / 2), 0);
      // set up our next goal, start moving toward it
      this.mNextRouteGoal = 1;
      this.mRouteVec.x = this.mRoute.mXIndices[this.mNextRouteGoal] - this.mActor.getXPosition();
      this.mRouteVec.y = this.mRoute.mYIndices[this.mNextRouteGoal] - this.mActor.getYPosition();
      // normalize and scale the vector, then apply the velocity
      this.mRouteVec.Normalize();
      this.mRouteVec = this.mRouteVec.Multiply(this.mRouteVelocity);
      this.mActor.mBody.SetLinearVelocity(this.mRouteVec);
    }

    /**
    * Figure out where we need to go next when driving a route
    */
    drive(): void {
      // quit if we're done and we don't loop
      if (this.mRouteDone) {
        return;
      }

      // if we haven't passed the goal, keep going. we tell if we've passed the goal by
      // comparing the magnitudes of the vectors from source (s) to here and from goal (g) to
      // here
      let sx: number = this.mRoute.mXIndices[this.mNextRouteGoal - 1] - this.mActor.getXPosition();
      let sy: number = this.mRoute.mYIndices[this.mNextRouteGoal - 1] - this.mActor.getYPosition();
      let gx: number = this.mRoute.mXIndices[this.mNextRouteGoal] - this.mActor.getXPosition();
      let gy: number = this.mRoute.mYIndices[this.mNextRouteGoal] - this.mActor.getYPosition();
      let sameXSign: boolean = (gx >= 0 && sx >= 0) || (gx <= 0 && sx <= 0);
      let sameYSign: boolean = (gy >= 0 && sy >= 0) || (gy <= 0 && sy <= 0);

      if (((gx == gy) && (gx == 0)) || (sameXSign && sameYSign)) {
        this.mNextRouteGoal++;
        if (this.mNextRouteGoal == this.mRoute.mPoints) {
          // reset if it's a loop, else terminate Route
          if (this.mRouteLoop) {
            this.startRoute();
          } else {
            this.mRouteDone = true;
            this.mActor.mBody.SetLinearVelocity(new PhysicsType2d.Vector2(0, 0));
          }
        } else {
          // advance to next point
          this.mRouteVec.x = this.mRoute.mXIndices[this.mNextRouteGoal] - this.mActor.getXPosition();
          this.mRouteVec.y = this.mRoute.mYIndices[this.mNextRouteGoal] - this.mActor.getYPosition();
          this.mRouteVec.Normalize();
          this.mRouteVec = this.mRouteVec.Multiply(this.mRouteVelocity);
          this.mActor.mBody.SetLinearVelocity(this.mRouteVec);
        }
      }
      // NB: 'else keep going at current velocity'
    }
  }
}
