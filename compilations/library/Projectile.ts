/// <reference path="./WorldActor.ts"/>
/// <reference path="./MainScene.ts"/>

/**
 * Projectiles are actors that can be thrown from the hero's location in order to remove enemies.
 */
class Projectile extends WorldActor {
    /// This is the initial point of the throw
    readonly mRangeFrom: PhysicsType2d.Vector2;
    /// We have to be careful in side-scrolling games, or else projectiles can continue traveling
    // off-screen forever. This field lets us cap the distance away from the hero that a projectile
    // can travel before we make it disappear.
    mRange: number;
    /// When projectiles collide, and they are not sensors, one will disappear. We can keep both on
    // screen by setting this false
    mDisappearOnCollide: boolean;
    /// How much damage does this projectile do?
    mDamage: number;

    /**
     * Create a projectile, and give it a physics body
     *
     * @param width    width of the projectile
     * @param height   height of the projectile
     * @param imgName  Name of the image file to use for this projectile
     * @param x        initial x position of the projectile
     * @param y        initial y position of the projectile
     * @param zIndex   The z plane of the projectile
     * @param isCircle True if it is a circle, false if it is a box
     */
    constructor(game: Lol, level: MainScene, width: number, height: number, imgName: string, x: number, y: number, zIndex: number, isCircle: boolean) {
        super(game, level, imgName, width, height);
        if (isCircle) {
            let radius = Math.max(width, height);
            this.setCirclePhysics(PhysicsType2d.Dynamics.BodyType.DYNAMIC, x, y, radius / 2);
        } else {
            this.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.DYNAMIC, x, y);
        }
        this.setFastMoving(true);
        this.mBody.SetGravityScale(0);
        this.setCollisionsEnabled(false);
        this.disableRotation();
        this.mScene.addActor(this, zIndex);
        this.mDisappearOnCollide = true;
        // In physicstype2d, Vector2 must take two arguments
        this.mRangeFrom = new PhysicsType2d.Vector2(0, 0);
        this.mRange = 1000;
    }

    /**
     * Code to run when a Projectile collides with a WorldActor.
     *
     * The only collision where Projectile is dominant is a collision with an Obstacle or another
     * Projectile.  On most collisions, a projectile will disappear.
     *
     * @param other   Other object involved in this collision
     * @param contact A description of the contact that caused this collision
     */
    //@Override
    onCollide(other: WorldActor, contact: PhysicsType2d.Dynamics.Contacts.Contact): void {
        // if this is an obstacle, check if it is a projectile callback, and if so, do the callback
        if (other instanceof Obstacle) {
            let o: Obstacle = other as Obstacle;
            if (o.mProjectileCollision) {
                o.mProjectileCollision.go(o, this, contact);
                // return... don't remove the projectile
                return;
            }
        }
        if (other instanceof Projectile) {
            if (!this.mDisappearOnCollide)
                return;
        }
        // only disappear if other is not a sensor
        let f = other.mBody.GetFixtures();
        f.MoveNext();
        if (f.Current().IsSensor()) {
          f.Reset();
          return;
        }
        this.remove(false);
    }

    /**
     * When drawing a projectile, we first check if it is too far from its starting point. We only
     * draw it if it is not.
     */
    //@Override
    public onRender(): void {
        // eliminate the projectile quietly if it has traveled too far
        let dx = Math.abs(this.mBody.GetPosition().x - this.mRangeFrom.x);
        let dy = Math.abs(this.mBody.GetPosition().y - this.mRangeFrom.y);
        if (dx * dx + dy * dy > this.mRange * this.mRange) {
           this.remove(true);
           return;
        }
        super.onRender();
    }
}
