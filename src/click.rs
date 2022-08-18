use bevy::prelude::*;
use crate::physics::{collision, PhysicsObject};

// components
#[derive(Component)]
pub struct Clickable;
#[derive(Component, Default)]
pub struct Clicked {
  pub pos: Vec2,
  pub standalone: bool,
}

// systems
pub fn listen (
  mut commands: Commands,
  windows: Res<Windows>,
  input: Res<Input<MouseButton>>,
  query: Query<PhysicsObject, With<Clickable>>,
) {
  if input.just_pressed(MouseButton::Left) {
    let pos = cursor_pos(windows.primary());
    let clickables = &query.iter().collect();
    let entity = collision(pos, clickables);
    let component = Clicked { pos, ..default() };
  
    // register to entity
    if let Some(entity) = entity {
      commands.entity(entity).insert(component);

    // spawn component as entity
    } else {
      commands.spawn().insert(Clicked {
        standalone: true,
        ..component
      });
    } 
  }
}

pub fn reset (
  mut commands: Commands,
  click: Query<(Entity, &Clicked)>,
) {
  let (entity, clicked) = click.single();

  // remove standalone entity
  if clicked.standalone {
    commands.entity(entity).despawn();
    
  // remove component from entity
  } else {
    commands.entity(entity).remove::<Clicked>();
  }
}

fn cursor_pos(window: &Window) -> Vec2 {
  // get the clicked position
  let mut pos = window.cursor_position().unwrap();
  // get the position in world space
  pos -= Vec2::new(window.width(), window.height()) / 2.;
  return pos;
}
