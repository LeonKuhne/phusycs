use bevy::prelude::*;
use crate::particle::*;

// resources 
#[derive(Component)]
pub struct Clicked {
  pub pos: Vec2,
}

// components
#[derive(Component)]
pub struct Selectable;
#[derive(Component)]
pub struct Selected;

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
    let entity = collision(pos, &selectables.iter().collect());
    let component = Clicked { pos };
    // attatch a click component
    if let Some(entity) = entity {
      commands.entity(entity).insert(component);
    // spawn a click entity
    } else {
      commands.spawn().insert(component);
    }
  }
}

pub fn unmark (
  mut commands: Commands,
){
  commands.remove_resource::<Selected>();
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
