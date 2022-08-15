use bevy::prelude::*;
use crate::particle::*;

// resources
#[derive(Default)]
pub struct Selected {
  pub entity: Option<Entity>,
  pub position: Vec2,
}

// components
#[derive(Component)]
pub struct Selectable;

// systems
pub fn mark (
  mut commands: Commands,
  windows: Res<Windows>,
  input: Res<Input<MouseButton>>,
  selectables: Query<(Entity, &Particle, &Transform), With<Selectable>>
){
  // update selected
  if input.just_pressed(MouseButton::Left) {
    let pos = cursor_pos(windows.primary());
    commands.insert_resource(Selected {
      entity: collision(pos, &selectables.iter().collect()),
      position: pos,
    });
  }
}

pub fn remove (
  mut commands: Commands,
  selected: Option<Res<Selected>>,
){
  if let Some(selected) = selected {
    if let Some(entity) = selected.entity {
      commands.entity(entity).despawn();
    }
  }
}

pub fn unmark (
  mut commands: Commands,
){
  commands.remove_resource::<Selected>();
}

fn collision(point: Vec2, targets: &Vec<(Entity, &Particle, &Transform)>) -> Option<Entity> {
  for (entity, particle, &target_transform) in targets.iter() {
    let distance = (point - target_transform.translation.truncate()).length();
    if distance < particle.radius {
      return Some(*entity);
    }
  }
  return None;
}

fn cursor_pos(window: &Window) -> Vec2 {
  // get the clicked position
  let mut pos = window.cursor_position().unwrap();
  // get the position in world space
  pos -= Vec2::new(window.width(), window.height()) / 2.;
  return pos;
}

