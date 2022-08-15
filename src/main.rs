use bevy::prelude::*;
mod select;
mod particle;

fn main() {
  App::new()
    .add_plugins(DefaultPlugins)
    .add_startup_system(camera)
    .add_system(select::mark)
    .add_system(particle::spawn)
    .add_system(select::remove)
    .add_system(select::unmark)
    .run()
}

fn camera(
  mut commands: Commands,
){
  commands
    .spawn_bundle(Camera3dBundle {
      transform: Transform::from_xyz(0., 0., 1000.),
      projection: OrthographicProjection {
        ..default()
      }.into(),
      ..default()
    });
}

