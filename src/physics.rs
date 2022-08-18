use bevy::prelude::*;
use crate::particle::Particle;

pub type PhysicsObject<'a> = (
  Entity, &'a Particle, &'a Transform);

pub fn collision (
  point: Vec2,
  targets: &Vec<PhysicsObject>
) -> Option<Entity> {
  for (entity, particle, &target) in targets.iter() {
    let distance = (point - target.translation.truncate()).length();
    if distance < particle.radius {
      return Some(*entity);
    }
  }
  return None;
}
