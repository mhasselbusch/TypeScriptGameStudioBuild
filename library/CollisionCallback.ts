/**
 * A callback to run when a WorldActor collides with another WorldActor
 */
interface CollisionCallback {
  /**
   * Provide some code to run in response to a collision between actors.
   *
   * @param thisActor    The actor to which this callback was attached
   * @param collideActor The actor who collided with <code>thisActor</code>
   * @param contact      A low-level description of the collision event
   */
  go(thisActor: WorldActor, collideActor: WorldActor, contact: PhysicsType2d.Dynamics.Contacts.Contact): void;
}
