use bevy::prelude::*;
mod select;
mod particle;
mod configurator;

fn main() {
  App::new()
    .add_plugins(DefaultPlugins)
    .add_startup_system(camera)
    .add_startup_system(configurator::spawn)
    .add_system(particle::spawn)
    .add_system(select::remove.after(particle::spawn))
    .add_system(select::unmark.after(select::remove))
    .add_system(select::mark.after(select::unmark))
    .run()
}

fn camera(
  mut commands: Commands,
){
  commands
    .spawn()
    .insert_bundle(Camera3dBundle {
      transform: Transform::from_xyz(0., 0., 1000.),
      projection: OrthographicProjection {
        ..default()
      }.into(),
      ..default()
    });
}

