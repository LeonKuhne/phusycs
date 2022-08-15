use bevy::prelude::*;
use bevy::pbr::PbrBundle;
use crate::select::*;

// components
#[derive(Component)]
pub struct Particle {
  pub radius: f32,
  pub mass: f32,
}

// systems
pub fn spawn(
  mut commands: Commands,
  mut meshes: ResMut<Assets<Mesh>>,
  mut materials: ResMut<Assets<StandardMaterial>>,
  selected: Option<Res<Selected>>,
){
  // enforce empty selection
  if let Some(selected) = selected {
    if !selected.entity.is_none() { return; }

    // spawn the note
    commands
      .spawn()
      .insert(Selectable)
      .insert(Particle {
        radius: 10.,
        mass: f32::INFINITY,
      })
      //.insert_bundle(PickableBundle::default())
      .insert_bundle(PbrBundle {
        transform: Transform::from_translation(selected.position.extend(0.)),
        mesh: meshes.add(Mesh::from(shape::Icosphere {
          radius: 10.0,
          subdivisions: 2,
        })),
        material: materials.add(StandardMaterial {
          base_color: Vec4::new(1.0,1.0,1.0,0.0).into(),
          unlit: true,
          ..default()
        }),
        ..default()
      });
  }
}

