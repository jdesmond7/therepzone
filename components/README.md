# Estructura de Componentes

Esta carpeta está organizada por roles de usuario para facilitar el mantenimiento y la navegación del código.

## 📁 Estructura

```
components/
├── athlete/          # Componentes específicos para atletas
├── coach/           # Componentes específicos para coaches
├── shared/          # Componentes compartidos entre roles
└── README.md        # Este archivo
```

## 🏃‍♂️ `/athlete/` - Componentes de Atleta

Componentes específicos para la funcionalidad de atletas:

- **`AthleteProfileView.vue`** - Perfil personalizado para atletas
  - Información personal
  - Dirección
  - Objetivos personales
  - Sin secciones de educación/credenciales

- **`AthleteExercisesView.vue`** - Vista de ejercicios para atletas
  - Solo visualización (sin edición)
  - Filtros por región y dificultad
  - Modal de detalles

## 👨‍🏫 `/coach/` - Componentes de Coach

Componentes específicos para la funcionalidad de coaches:

- **`ProfileView.vue`** - Perfil completo para coaches
  - Información personal
  - Dirección
  - Educación
  - Credenciales y certificaciones

- **`CoachClientsView.vue`** - Gestión de clientes
- **`CoachWorkoutsView.vue`** - Gestión de entrenamientos
- **`CoachExercisesView.vue`** - Gestión de ejercicios (con edición)
- **`CoachProgrammingView.vue`** - Programación de entrenamientos

## 🔄 `/shared/` - Componentes Compartidos

Componentes que se utilizan en múltiples roles:

### UI Components
- **`AppButtonPrimary.vue`** - Botón primario
- **`AppButtonSecondary.vue`** - Botón secundario
- **`AppButtonDestructive.vue`** - Botón destructivo
- **`AppInput.vue`** - Campo de entrada
- **`AppTextarea.vue`** - Área de texto
- **`AppCard.vue`** - Tarjeta contenedora

### Custom Components
- **`CustomSelect.vue`** - Selector personalizado
- **`CustomMultiSelect.vue`** - Selector múltiple
- **`CustomDropdown.vue`** - Menú desplegable
- **`CustomTooltip.vue`** - Tooltip personalizado
- **`DatePickerInput.vue`** - Selector de fecha

### Data Components
- **`DataTable.vue`** - Tabla de datos reutilizable
- **`DynamicBadges.vue`** - Badges dinámicos
- **`ExerciseCard.vue`** - Tarjeta de ejercicio
- **`ExerciseEditModal.vue`** - Modal de edición de ejercicios
- **`ExerciseProgressChart.vue`** - Gráfico de progreso

### Utility Components
- **`TheLogo.vue`** - Logo de la aplicación
- **`PasswordInput.vue`** - Campo de contraseña
- **`GlobalLoading.vue`** - Indicador de carga global
- **`RoundedCheckbox.vue`** - Checkbox redondeado
- **`Tabs.vue`** - Componente de pestañas
- **`TermsModal.vue`** - Modal de términos
- **`GoogleAddressAutocomplete.vue`** - Autocompletado de direcciones
- **`UserInfoForm.vue`** - Formulario de información de usuario

## 🎯 Beneficios de esta estructura

1. **Organización clara**: Fácil identificar qué componentes pertenecen a cada rol
2. **Mantenimiento**: Cambios específicos de rol están aislados
3. **Reutilización**: Componentes compartidos están centralizados
4. **Escalabilidad**: Fácil agregar nuevos roles o componentes
5. **Navegación**: Estructura intuitiva para desarrolladores

## 📝 Convenciones

- **Nomenclatura**: `[Role][Feature]View.vue` para vistas principales
- **Importaciones**: Usar rutas relativas desde la carpeta correspondiente
- **Compartidos**: Componentes en `/shared/` deben ser genéricos y reutilizables
- **Específicos**: Componentes en `/athlete/` o `/coach/` pueden ser específicos del rol

## 🔄 Migración

Si necesitas mover un componente:

1. Identifica si es específico de un rol o compartido
2. Mueve el archivo a la carpeta correspondiente
3. Actualiza todas las importaciones
4. Verifica que no haya errores de linter
5. Prueba la funcionalidad 